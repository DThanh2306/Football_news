const knex = require("../database/knex");
const ApiError = require("../api-error");

async function findBySlug(slug) {
  return await knex("clubs").where({ club_slug: slug }).first();
}

async function createClub(data) {
  const [club] = await knex("clubs").insert(data).returning(["club_id"]);
  return club;
}

async function addClubToLeagues(club_id, league_ids) {
  const records = league_ids.map(league_id => ({ club_id, league_id }));
  await knex("club_league").insert(records);
}

async function getAllClubs({ league_id, country } = {}) {
  const c = knex({ c: 'clubs' })
    .leftJoin({ cl: 'club_league' }, 'cl.club_id', 'c.club_id')
    .leftJoin({ l: 'leagues' }, 'l.league_id', 'cl.league_id')

  if (league_id) c.where('cl.league_id', league_id)
  if (country) c.where('c.country', country)

  // Build aggregation of leagues per club
  const leaguesAgg = knex.raw(
    `COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('league_id', l.league_id, 'league_name', l.league_name)) FILTER (WHERE l.league_id IS NOT NULL), '[]'::json) as leagues`
  )

  const rows = await c
    .select(
      'c.club_id',
      'c.club_name',
      'c.club_img',
      'c.club_slug',
      'c.country',
      'c.external_source',
      'c.external_team_id',
      'c.external_logo_url',
      'c.logo_last_synced_at',
      leaguesAgg,
    )
    .groupBy('c.club_id')
    .orderBy('c.club_name', 'asc')

  return rows
}

async function getClubById(id) {
  return await knex("clubs")
    .select("club_id", "club_name", "club_img", "club_slug")
    .where({ club_id: id })
    .first();
}

async function updateClub(id, data) {
  return await knex("clubs").where({ club_id: id }).update(data);
}

async function updateClubLeagues(club_id, league_ids) {
  await knex("club_league").where({ club_id }).del();
  if (league_ids.length > 0) {
    const records = league_ids.map(league_id => ({ club_id, league_id }));
    await knex("club_league").insert(records);
  }
}

async function deleteClub(id) {
  await knex("club_league").where({ club_id: id }).del();
  return await knex("clubs").where({ club_id: id }).del();
}

async function updateClubExternal(id, { external_source, external_team_id, external_logo_url, overwrite_logo = false }) {
  // Build update
  const update = { external_source, external_team_id }
  if (external_logo_url) {
    update.external_logo_url = external_logo_url
    update.logo_last_synced_at = knex.fn.now()
  }
  // Optionally set club_img if empty and have external_logo_url
  if (external_logo_url && overwrite_logo) {
    update.club_img = external_logo_url
  } else if (external_logo_url) {
    const row = await knex('clubs').select('club_img').where({ club_id: id }).first()
    if (!row?.club_img) update.club_img = external_logo_url
  }
  return await knex('clubs').where({ club_id: id }).update(update)
}

const providers = {
  'football-data': require('../modules/providers/footballData.provider'),
  'api-football': require('../modules/providers/apiFootball.provider'),
}

async function importClubsFromProvider({ provider, league_external_id, league_id, season_year, update_club_logos, update_unmapped_clubs }) {
  const client = providers[provider]
  if (!client?.fetchTeams) throw new ApiError(400, 'Unsupported provider')
  const teams = await client.fetchTeams({ league_external_id, season_year })
  let created = 0, updated = 0
  for (const t of teams) {
    if (!t.external_team_id) continue
    // 1) find by external mapping first
    let existing = await knex('clubs')
      .select('club_id', 'club_img')
      .where({ external_source: provider, external_team_id: t.external_team_id })
      .first()

    // 2) If not found and update_unmapped_clubs, try match by name (case-insensitive), optionally by country
    if (!existing && update_unmapped_clubs && t.club_name) {
      const q = knex('clubs').select('club_id', 'club_img')
        .whereILike('club_name', t.club_name) // simple ILIKE match; can be improved with normalization
      if (t.country) q.andWhere('country', t.country)
      existing = await q.first()
      if (existing) {
        // Attach external mapping to this internal club
        const attach = {
          external_source: provider,
          external_team_id: t.external_team_id,
          external_logo_url: t.club_img || undefined,
          logo_last_synced_at: t.club_img ? knex.fn.now() : undefined,
          club_name: t.club_name || undefined,
          country: t.country || undefined,
        }
        if (update_club_logos && t.club_img && !existing.club_img) attach.club_img = t.club_img
        await knex('clubs').where({ club_id: existing.club_id }).update(attach)
        updated++
        if (league_id) {
          await knex('club_league').insert({ club_id: existing.club_id, league_id }).onConflict(['club_id','league_id']).ignore()
        }
        continue
      }
    }

    if (existing) {
      const update = {
        club_name: t.club_name || undefined,
        external_logo_url: t.club_img || undefined,
        logo_last_synced_at: t.club_img ? knex.fn.now() : undefined,
        country: t.country || undefined,
      }
      if (update_club_logos && t.club_img && !existing.club_img) {
        update.club_img = t.club_img
      }
      await knex('clubs').where({ club_id: existing.club_id }).update(update)
      updated++
      if (league_id) {
        await knex('club_league').insert({ club_id: existing.club_id, league_id }).onConflict(['club_id','league_id']).ignore()
      }
    } else {
      const base = {
        club_name: t.club_name || 'Unknown',
        club_img: (update_club_logos && t.club_img) ? t.club_img : (t.club_img || ''),
        club_slug: null,
        country: t.country || null,
        external_source: provider,
        external_team_id: t.external_team_id,
        external_logo_url: t.club_img || null,
        logo_last_synced_at: t.club_img ? knex.fn.now() : null,
      }
      const [row] = await knex('clubs').insert(base).returning(['club_id'])
      created++
      if (league_id) {
        await knex('club_league').insert({ club_id: row.club_id, league_id }).onConflict(['club_id','league_id']).ignore()
      }
    }
  }
  return { created, updated, total: teams.length }
}

module.exports = {
  findBySlug,
  createClub,
  addClubToLeagues,
  getAllClubs,
  getClubById,
  updateClub,
  updateClubLeagues,
  deleteClub,
  updateClubExternal,
  importClubsFromProvider,
};
