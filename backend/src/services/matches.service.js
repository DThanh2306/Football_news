const knex = require("../database/knex");
const ApiError = require("../api-error");

async function searchMatches({ page = 1, pageSize = 10, q = '', league_id = null, season_id = null, status = null, team_id = null, country = null, date_from = null, date_to = null, sort = 'match_date', order = 'desc' }) {
  try {
    const allowedSort = new Set(['match_date', 'home_score', 'away_score', 'status', 'round']);
    const sortCol = allowedSort.has(sort) ? sort : 'match_date';
    const sortDir = order && order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const baseQuery = knex('matches')
      .leftJoin('clubs as home', 'matches.home_fc_id', 'home.club_id')
      .leftJoin('clubs as away', 'matches.away_fc_id', 'away.club_id')
      .select(
        'matches.*',
        knex.raw('COALESCE(home.club_name, matches.home_team_name) as home_name'),
        knex.raw('COALESCE(home.club_img, matches.home_team_img) as home_img'),
        knex.raw('COALESCE(away.club_name, matches.away_team_name) as away_name'),
        knex.raw('COALESCE(away.club_img, matches.away_team_img) as away_img')
      );

    if (q) {
      baseQuery.where((qb) => {
        qb.whereILike('round', `%${q}%`)
          .orWhereILike('home.club_name', `%${q}%`)
          .orWhereILike('away.club_name', `%${q}%`);
      });
    }

    if (league_id) baseQuery.andWhere('matches.league_id', league_id);
    if (season_id) baseQuery.andWhere('matches.season_id', season_id);
    if (status) baseQuery.andWhere('matches.status', status);
    if (team_id) baseQuery.andWhere((qb) => {
      qb.where('matches.home_fc_id', team_id).orWhere('matches.away_fc_id', team_id);
    });
    if (country) baseQuery.andWhere((qb) => {
      qb.where('home.country', country).orWhere('away.country', country)
    })
    if (date_from) baseQuery.andWhere('matches.match_date', '>=', date_from);
    if (date_to) baseQuery.andWhere('matches.match_date', '<=', date_to);

    const countQuery = baseQuery.clone().clearSelect().count({ count: '*' }).first();
    const { count } = await countQuery;
    const total = parseInt(count, 10) || 0;

    const items = await baseQuery.orderBy(sortCol, sortDir).limit(pageSize).offset((page - 1) * pageSize);

    return { items, pagination: { page, pageSize, total } };
  } catch (error) {
    throw new ApiError(500, 'Lỗi khi truy vấn danh sách trận đấu', error);
  }
}

async function getMatchById(match_id) {
  try {
    return await knex("matches").where({ match_id }).first();
  } catch (error) {
    throw new ApiError(500, "Lỗi khi truy vấn trận đấu", error);
  }
}

async function createMatch(data) {
  try {
    const [match] = await knex("matches").insert(data).returning("*");
    return match;
  } catch (error) {
    throw new ApiError(500, "Lỗi khi tạo trận đấu", error);
  }
}

async function updateMatch(match_id, data) {
  try {
    return await knex("matches").where({ match_id }).update(data);
  } catch (error) {
    throw new ApiError(500, "Lỗi khi cập nhật trận đấu", error);
  }
}

async function deleteMatch(match_id) {
  try {
    return await knex("matches").where({ match_id }).del();
  } catch (error) {
    throw new ApiError(500, "Lỗi khi xoá trận đấu", error);
  }
}

async function importMatchesFromProvider({ provider, date_from, date_to, league_external_id, league_id, country }) {

  try {
    const source = (provider || '').toLowerCase();
    if (!source) throw new ApiError(400, 'Missing provider');

    // Lazy-load provider client
    let client;
    if (source === 'football-data') {
      client = require('../modules/providers/footballData.provider');
    } else if (source === 'api-football') {
      client = require('../modules/providers/apiFootball.provider');
    } else {
      throw new ApiError(400, `Unsupported provider: ${provider}`);
    }

    // Fetch fixtures from provider (normalized)
    const fixtures = await client.fetchFixtures({ date_from, date_to, league_external_id });

    // Preload column infos to detect optional external mapping columns
    const clubsCols = await knex('clubs').columnInfo().catch(() => ({}))
    const leaguesCols = await knex('leagues').columnInfo().catch(() => ({}))
    const seasonsCols = await knex('seasons').columnInfo().catch(() => ({}))
    const hasClubExternal = 'external_source' in clubsCols && 'external_team_id' in clubsCols
    const hasLeagueExternal = 'external_source' in leaguesCols && 'external_league_id' in leaguesCols
    const hasSeasonExternal = 'external_source' in seasonsCols && 'external_season_id' in seasonsCols

    async function mapLeagueIdByExternalOrName(source, fx) {
      // Try external columns first if exist
      if (hasLeagueExternal) {
        const ext = fx.league_external_id || fx.provider_league_id || fx.provider_league_code || league_external_id
        if (ext) {
          const row = await knex('leagues')
            .where({ external_source: source, external_league_id: String(ext) })
            .first()
            .catch(() => null)
          if (row?.league_id) return row.league_id
        }
      }
      // Fallback by league name (no schema change required)
      if (fx.league_name) {
        let q = knex('leagues').select('league_id')
        if (q.whereILike) q = q.whereILike('league_name', `%${fx.league_name}%`)
        else q = q.where('league_name', 'ilike', `%${fx.league_name}%`)
        const r = await q.first().catch(() => null)
        if (r?.league_id) return r.league_id
      }
      return null
    }

    async function mapClubIdByExternal(source, teamExtId) {
      if (!hasClubExternal) return null
      if (!teamExtId) return null
      const row = await knex('clubs')
        .where({ external_source: source, external_team_id: String(teamExtId) })
        .first()
        .catch(() => null)
      return row?.club_id || null
    }

    async function mapSeasonId(leagueId, fx) {
      if (!leagueId) return fx.season_id || null
      // Prefer by explicit season_id from provider if available and exists under league
      if (fx.season_id) {
        const s = await knex('seasons').where({ season_id: fx.season_id, league_id: leagueId }).first().catch(() => null)
        if (s) return s.season_id
      }
      // Try by season_year
      if (fx.season_year) {
        const s = await knex('seasons').where({ league_id: leagueId, year: fx.season_year }).first().catch(() => null)
        if (s) return s.season_id
      }
      // Try by date range containing match_date
      if (fx.match_date) {
        const s = await knex('seasons')
          .where({ league_id: leagueId })
          .andWhere('start_date', '<=', fx.match_date)
          .andWhere('end_date', '>=', fx.match_date)
          .first()
          .catch(() => null)
        if (s) return s.season_id
      }
      return null
    }

    // Upsert into DB: requires mapping clubs/leagues/seasons. This is a simplified placeholder.
    // TODO: Implement robust mapping via external_id columns or mapping table.
    // Inspect table columns to avoid inserting non-existing fields
    const colInfo = await knex('matches').columnInfo();
    const allowedCols = new Set(Object.keys(colInfo || {}));

    let inserted = 0;
    for (const fx of fixtures) {
      // Build full payload first
      // Try to map league, season and teams
      let mapped_home_id = null
      let mapped_away_id = null

      // League: prefer explicit league_id; else try external mapping
      let mapped_league_id = league_id ?? null
      if (!mapped_league_id) {
        mapped_league_id = await mapLeagueIdByExternalOrName(source, fx)
      }

      // Season
      const mapped_season_id = await mapSeasonId(mapped_league_id ?? fx.league_id ?? null, fx)

      // Teams: prefer external ids when available, else fallback name mapping (scoped by mapped_league_id/country)
      if (hasClubExternal) {
        mapped_home_id = await mapClubIdByExternal(source, fx.home_team_external_id)
        mapped_away_id = await mapClubIdByExternal(source, fx.away_team_external_id)
      }
      if (!mapped_home_id || !mapped_away_id) {
        async function mapClubByNameScoped(name) {
          if (!name) return null
          // 1) exact case-insensitive match
          let q1 = knex('clubs').select('clubs.club_id')
          if (mapped_league_id) q1 = q1.join('club_league', 'club_league.club_id', 'clubs.club_id').where('club_league.league_id', mapped_league_id)
          if (country) q1 = q1.andWhere('clubs.country', country)
          q1 = q1.whereRaw('LOWER(clubs.club_name) = LOWER(?)', [name])
          const exact = await q1.first().catch(() => null)
          if (exact?.club_id) return exact.club_id
          // 2) fallback contains ILIKE
          let q2 = knex('clubs').select('clubs.club_id')
          if (mapped_league_id) q2 = q2.join('club_league', 'club_league.club_id', 'clubs.club_id').where('club_league.league_id', mapped_league_id)
          if (country) q2 = q2.andWhere('clubs.country', country)
          if (q2.whereILike) q2 = q2.whereILike('clubs.club_name', `%${name}%`)
          else q2 = q2.where('clubs.club_name', 'ilike', `%${name}%`)
          const like = await q2.first().catch(() => null)
          return like?.club_id || null
        }
        mapped_home_id = mapped_home_id || await mapClubByNameScoped(fx.home_team_name)
        mapped_away_id = mapped_away_id || await mapClubByNameScoped(fx.away_team_name)
      }

      // Team name mapping (scoped): only when we have hint (league_id or country) and id not already mapped
      if (league_id || country) {
        async function mapClubByName(name) {
          if (!name) return null
          let q = knex('clubs').select('clubs.club_id')
          if (league_id) {
            q = q.join('club_league', 'club_league.club_id', 'clubs.club_id').where('club_league.league_id', league_id)
          }
          if (country) {
            q = q.andWhere('clubs.country', country)
          }
          if (q.andWhereILike) {
            q = q.andWhereILike('clubs.club_name', name)
          } else if (q.whereILike) {
            q = q.whereILike('clubs.club_name', name)
          } else if (q.where) {
            q = q.where('clubs.club_name', 'ilike', `%${name}%`)
          }
          const row = await q.first?.().catch?.(() => null) || null
          return row?.club_id || null
        }

        if (!mapped_home_id) mapped_home_id = await mapClubByName(fx.home_team_name)
        if (!mapped_away_id) mapped_away_id = await mapClubByName(fx.away_team_name)
      }

      // Normalize round to number-like string (e.g., EPL wants just number)
      function extractRoundNumber(r) {
        if (r == null) return null
        if (typeof r === 'number') return String(r)
        const s = String(r)
        // common patterns: "Regular Season - 1", "Matchday 3", "MD 3", "Round 7"
        const nums = s.match(/\d+/g)
        if (nums && nums.length) return String(Number(nums[nums.length - 1]))
        return s // fallback keep original
      }

      const fullPayload = {
        league_id: mapped_league_id ?? fx.league_id ?? null,
        season_id: mapped_season_id ?? fx.season_id ?? null,
        home_fc_id: mapped_home_id ?? fx.home_fc_id ?? null,
        away_fc_id: mapped_away_id ?? fx.away_fc_id ?? null,
        match_date: fx.match_date,
        status: fx.status || 'scheduled',
        round: extractRoundNumber(fx.round),
        home_score: fx.home_score ?? null,
        away_score: fx.away_score ?? null,
        external_source: source,
        external_id: fx.external_id,
        home_team_name: fx.home_team_name || null,
        away_team_name: fx.away_team_name || null,
        home_team_img: fx.home_team_img || null,
        away_team_img: fx.away_team_img || null,
      };

      // Filter payload by existing columns
      // Filter payload by existing columns and drop null for home/away ids to let DB defaults apply
      const payload = Object.fromEntries(
        Object.entries(fullPayload).filter(([k, v]) => {
          if (!allowedCols.has(k)) return false
          if ((k === 'home_fc_id' || k === 'away_fc_id') && v == null) return false
          return true
        })
      );
      // Also drop null scores if columns exist but value is null, to avoid overwriting existing scores on update
      if (payload.home_score == null) delete payload.home_score
      if (payload.away_score == null) delete payload.away_score

      // Try to find existing by external ids (if columns exist), otherwise by unique heuristic
      let exists = null;
      // Heuristic: when we have home/away ids and date, try to find an existing match to update scores
      if (!exists && allowedCols.has('match_date') && fullPayload.match_date && (fullPayload.home_fc_id || fullPayload.away_fc_id)) {
        exists = await knex('matches')
          .where({ match_date: fullPayload.match_date })
          .modify((qb) => {
            if (fullPayload.home_fc_id) qb.andWhere('home_fc_id', fullPayload.home_fc_id)
            if (fullPayload.away_fc_id) qb.andWhere('away_fc_id', fullPayload.away_fc_id)
          })
          .first()
          .catch(() => null)
      }
      if (allowedCols.has('external_source') && allowedCols.has('external_id')) {
        exists = await knex('matches')
          .where({ external_source: source, external_id: fx.external_id })
          .first()
          .catch(() => null);
      } else if (allowedCols.has('match_date') && allowedCols.has('home_fc_id') && allowedCols.has('away_fc_id')) {
        exists = await knex('matches')
          .where({ match_date: fx.match_date, home_fc_id: fx.home_fc_id ?? null, away_fc_id: fx.away_fc_id ?? null })
          .first()
          .catch(() => null);
      }

      if (exists) {
        await knex('matches').where({ match_id: exists.match_id }).update(payload);
      } else {
        await knex('matches').insert(payload);
        inserted += 1;
      }
    }

    return { provider: source, total: fixtures.length, created: inserted, updated: fixtures.length - inserted };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Import from provider failed', error);
  }
}
module.exports = {
  searchMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  importMatchesFromProvider,
};
