const knex = require("../database/knex");

async function createPlayer(data) {
  const [player] = await knex("players").insert(data).returning("*");
  return player;
}

async function findBySlug(slug) {
  return knex("players").where({ player_slug: slug }).first();
}

async function addCareer(data) {
  return knex("career").insert(data);
}

async function getAllPlayers() {
  // Pick latest career per player (prefer active where left_at IS NULL, then newest joined_at)
  const latestCareerRaw = knex.raw(`(
    SELECT DISTINCT ON (player_id) player_id, club_id, joined_at, left_at, number, position
    FROM career
    ORDER BY player_id, (left_at IS NULL) DESC, joined_at DESC
  ) lc`)

  const rows = await knex({ p: 'players' })
    .leftJoin(latestCareerRaw, 'lc.player_id', 'p.player_id')
    .leftJoin({ c: 'clubs' }, 'c.club_id', 'lc.club_id')
    .select(
      'p.*',
      'lc.club_id as club_id',
      'lc.joined_at as joined_at',
      'lc.left_at as left_at',
      'lc.number as number',
      'lc.position as position',
      'c.club_name as club_name',
      'c.club_img as club_img'
    )
    .orderBy('p.player_name', 'asc')

  // Shape to include nested club
  return rows.map(r => ({
    ...r,
    club: r.club_id ? { club_id: r.club_id, club_name: r.club_name, club_img: r.club_img } : null,
  }))
}

async function getPlayerById(id) {
  const latestCareerRaw = knex.raw(`(
    SELECT DISTINCT ON (player_id) player_id, club_id, joined_at, left_at, number, position
    FROM career
    WHERE player_id = ?
    ORDER BY player_id, (left_at IS NULL) DESC, joined_at DESC
  ) lc`, [id])

  const row = await knex({ p: 'players' })
    .leftJoin(latestCareerRaw, 'lc.player_id', 'p.player_id')
    .leftJoin({ c: 'clubs' }, 'c.club_id', 'lc.club_id')
    .select(
      'p.*',
      'lc.club_id as club_id',
      'lc.joined_at as joined_at',
      'lc.left_at as left_at',
      'lc.number as number',
      'lc.position as position',
      'c.club_name as club_name',
      'c.club_img as club_img'
    )
    .where('p.player_id', id)
    .first()

  if (!row) return null
  return {
    ...row,
    club: row.club_id ? { club_id: row.club_id, club_name: row.club_name, club_img: row.club_img } : null,
  }
}

async function getPlayersByClubId(club_id) {
  const players = await knex("career")
    .join("players", "career.player_id", "players.player_id")
    .leftJoin("clubs", "career.club_id", "clubs.club_id")
    .select(
      "players.*",
      "clubs.club_id as club_id",
      "clubs.club_name as club_name",
      "clubs.club_img as club_img",
      "career.joined_at",
      "career.left_at",
      "career.number",
      "career.position"
    )
    .where("career.club_id", club_id)
    .orderBy("career.joined_at", "desc");

  return players.map((p) => ({
    ...p,
    club: {
      club_id: p.club_id,
      club_name: p.club_name,
      club_img: p.club_img,
    },
  }));
}

async function updatePlayer(id, updateData) {
  return knex("players").where({ player_id: id }).update(updateData);
}

async function deletePlayer(id) {
  return knex("players").where({ player_id: id }).del();
}


function slugifyName(name) {
  return (name || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function importPlayersFromProvider({ provider, club_id, league_id, update_only, season_year }) {
  const clubsQuery = require('./clubs.service')
  const apiFootball = require('../modules/providers/apiFootball.provider')
  const footballData = require('../modules/providers/footballData.provider')

  const providers = { 'api-football': apiFootball, 'football-data': footballData }
  const pv = providers[provider]
  if (!pv) throw new Error('Unsupported provider')

  const targetClubs = []
  if (club_id) {
    const club = await knex('clubs').where({ club_id }).first()
    if (!club) return { created: 0, updated: 0, total: 0 }
    targetClubs.push(club)
  } else if (league_id) {
    const list = await knex('club_league').join('clubs', 'club_league.club_id', 'clubs.club_id').where('club_league.league_id', league_id).select('clubs.*')
    targetClubs.push(...list)
  } else {
    return { created: 0, updated: 0, total: 0 }
  }

  let created = 0, updated = 0, total = 0

  for (const club of targetClubs) {
    if (!club.external_source || !club.external_team_id || club.external_source !== provider) {
      // skip clubs without mapping for this provider
      continue
    }
    const players = await pv.fetchSquadByTeam({ team_external_id: club.external_team_id, season_year })
    total += players.length
    for (const p of players) {
      if (!p.player_name) continue
      // Try to find existing by name + dob if present
      let existing = await knex('players').where(q => {
        q.whereILike('player_name', p.player_name)
        if (p.player_date_of_birth) q.andWhere('player_date_of_birth', p.player_date_of_birth)
      }).first()

      if (existing) {
        const upd = {}
        if (p.player_nationality && !existing.player_nationality) upd.player_nationality = p.player_nationality
        if (p.player_img && !existing.player_img) upd.player_img = p.player_img
        if (Object.keys(upd).length) {
          await knex('players').where({ player_id: existing.player_id }).update(upd)
        }
        // ensure career link exists (prefer update if active career exists)
        const active = await knex('career').where({ player_id: existing.player_id, club_id: club.club_id }).whereNull('left_at').first()
        if (active) {
          await knex('career').where({ player_id: existing.player_id, club_id: club.club_id, joined_at: active.joined_at }).update({
            number: p.number ?? active.number,
            position: p.position ?? active.position,
          })
        } else {
          await knex('career').insert({ player_id: existing.player_id, club_id: club.club_id, joined_at: knex.fn.now(), number: p.number || null, position: p.position || null }).onConflict(['player_id','club_id','joined_at']).ignore()
        }
        updated++
      } else if (!update_only) {
        // create new
        const base = {
          player_name: p.player_name,
          player_infor: null,
          player_date_of_birth: p.player_date_of_birth || null,
          player_nationality: p.player_nationality || null,
          player_img: p.player_img || null,
          player_slug: slugifyName(p.player_name),
        }
        const [row] = await knex('players').insert(base).returning(['player_id'])
        await knex('career').insert({ player_id: row.player_id, club_id: club.club_id, joined_at: knex.fn.now(), number: p.number || null, position: p.position || null }).onConflict(['player_id','club_id','joined_at']).ignore()
        created++
      }
    }
  }

  return { created, updated, total }
}

module.exports = {
  createPlayer,
  findBySlug,
  addCareer,
  getAllPlayers,
  getPlayerById,
  getPlayersByClubId,
  updatePlayer,
  deletePlayer,
  importPlayersFromProvider,
};
