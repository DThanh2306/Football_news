const axios = require('axios')
const ApiError = require('../../api-error')

// Placeholder provider for API-FOOTBALL via RapidAPI
// Requires RAPIDAPI_KEY and API_FOOTBALL_HOST in env

function normalizeFixture(item) {
  const fixture = item.fixture || {}
  const league = item.league || {}
  const teams = item.teams || {}
  const home_score = Number.isFinite(item.goals?.home) ? Number(item.goals.home) : null
  const away_score = Number.isFinite(item.goals?.away) ? Number(item.goals.away) : null
  const season_year = Number.isFinite(league.season) ? Number(league.season) : (Number.isFinite(item.season) ? Number(item.season) : null)
  return {
    external_id: String(fixture.id),
    match_date: fixture.date, // ISO
    status: (fixture.status?.short || 'TBD').toLowerCase(),
    round: league.round || null,
    provider_league_id: league.id,
    provider_league_code: String(league.id),
    league_external_id: league.id != null ? String(league.id) : null,
    league_name: league.name || null,
    season_year,
    season_id: item.season || league.season || null,
    home_team_name: teams.home?.name || null,
    away_team_name: teams.away?.name || null,
    home_team_img: teams.home?.logo || null,
    away_team_img: teams.away?.logo || null,
    home_team_external_id: teams.home?.id != null ? String(teams.home.id) : null,
    away_team_external_id: teams.away?.id != null ? String(teams.away.id) : null,
    home_score,
    away_score,
    home_fc_id: null,
    away_fc_id: null,
  }
}

async function fetchFixtures({ date_from, date_to, league_external_id }) {
  const key = process.env.RAPIDAPI_KEY
  const host = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
  if (!key) throw new ApiError(500, 'Missing RAPIDAPI_KEY for API-FOOTBALL')

  const headers = { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
  const params = {}
  if (date_from) params.from = date_from
  if (date_to) params.to = date_to
  if (league_external_id) params.league = league_external_id
  // If you know season, you can add params.season

  const url = `https://${host}/fixtures`

  try {
    const res = await axios.get(url, { headers, params })
    const list = Array.isArray(res.data.response) ? res.data.response : []
    return list.map(normalizeFixture)
  } catch (err) {
    throw new ApiError(502, 'Provider API-FOOTBALL request failed', err)
  }
}

async function fetchTeams({ league_external_id, season_year }) {
  const key = process.env.RAPIDAPI_KEY
  const host = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
  if (!key) throw new ApiError(500, 'Missing RAPIDAPI_KEY for API-FOOTBALL')
  if (!league_external_id) throw new ApiError(400, 'Missing league_external_id')
  const headers = { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
  const params = { league: league_external_id }
  if (season_year) params.season = season_year
  const url = `https://${host}/teams`
  try {
    const res = await axios.get(url, { headers, params })
    const list = Array.isArray(res.data.response) ? res.data.response : []
    return list.map(x => ({
      external_team_id: x.team?.id != null ? String(x.team.id) : null,
      club_name: x.team?.name || null,
      club_img: x.team?.logo || null,
      country: x.team?.country || x.country?.name || null,
    }))
  } catch (err) {
    throw new ApiError(502, 'Provider API-FOOTBALL teams request failed', err)
  }
}

async function fetchSquadByTeam({ team_external_id, season_year }) {
  const key = process.env.RAPIDAPI_KEY
  const host = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
  if (!key) throw new ApiError(500, 'Missing RAPIDAPI_KEY for API-FOOTBALL')
  if (!team_external_id) throw new ApiError(400, 'Missing team_external_id')
  const headers = { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
  const params = { team: team_external_id }
  if (season_year) params.season = season_year
  const url = `https://${host}/players`
  try {
    const res = await axios.get(url, { headers, params })
    const list = Array.isArray(res.data.response) ? res.data.response : []
    // API returns paginated; keep only first page for simplicity
    const players = []
    for (const item of list) {
      const p = item.player || {}
      const sp = (item.statistics && item.statistics[0]) || {}
      players.push({
        external_player_id: p.id != null ? String(p.id) : null,
        player_name: p.name || null,
        player_nationality: p.nationality || sp.team?.country || null,
        player_date_of_birth: p.birth?.date || null,
        position: sp?.games?.position || null,
        number: sp?.games?.number || null,
        player_img: p.photo || null,
      })
    }
    return players
  } catch (err) {
    throw new ApiError(502, 'Provider API-FOOTBALL players request failed', err)
  }
}

module.exports = { fetchFixtures, fetchTeams, fetchSquadByTeam }
