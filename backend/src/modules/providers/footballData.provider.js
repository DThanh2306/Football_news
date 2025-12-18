const axios = require('axios')
const ApiError = require('../../api-error')

// Placeholder provider for football-data.org
// NOTE: This is a skeleton. You must set FOOTBALL_DATA_API_KEY in env and implement mapping.

function normalizeFixture(item) {
  // Map provider response to normalized shape expected by import service
  const homeTeam = item.homeTeam || {}
  const awayTeam = item.awayTeam || {}
  const competition = item.competition || {}
  const ft = item.score?.fullTime || {}
  const home_score = Number.isFinite(ft.home) ? Number(ft.home) : null
  const away_score = Number.isFinite(ft.away) ? Number(ft.away) : null
  const season_year = new Date(item.utcDate).getUTCFullYear()
  return {
    external_id: String(item.id),
    match_date: item.utcDate, // ISO string
    status: (item.status || 'SCHEDULED').toLowerCase(),
    round: item.matchday ? `MD ${item.matchday}` : null,
    provider_league_id: competition.id,
    provider_league_code: competition.code,
    league_external_id: competition.id != null ? String(competition.id) : (competition.code || null),
    league_name: competition.name || null,
    season_year,
    season_id: null,
    home_team_name: homeTeam.name || null,
    away_team_name: awayTeam.name || null,
    home_team_img: homeTeam.crest || null,
    away_team_img: awayTeam.crest || null,
    home_team_external_id: homeTeam.id != null ? String(homeTeam.id) : null,
    away_team_external_id: awayTeam.id != null ? String(awayTeam.id) : null,
    home_score,
    away_score,
    home_fc_id: null,
    away_fc_id: null,
  }
}

async function fetchFixtures({ date_from, date_to, league_external_id }) {
  const token = process.env.FOOTBALL_DATA_API_KEY
  if (!token) throw new ApiError(500, 'Missing FOOTBALL_DATA_API_KEY')

  const headers = { 'X-Auth-Token': token }
  const params = {}
  if (date_from) params.dateFrom = date_from
  if (date_to) params.dateTo = date_to

  let url
  if (league_external_id) {
    url = `https://api.football-data.org/v4/competitions/${league_external_id}/matches`
  } else {
    url = `https://api.football-data.org/v4/matches`
  }

  try {
    const res = await axios.get(url, { headers, params })
    const list = Array.isArray(res.data.matches) ? res.data.matches : []
    console.log(list)
    return list.map(normalizeFixture)
  } catch (err) {
    throw new ApiError(502, 'Provider football-data request failed', err)
  }
}

async function fetchTeams({ league_external_id }) {
  const token = process.env.FOOTBALL_DATA_API_KEY
  if (!token) throw new ApiError(500, 'Missing FOOTBALL_DATA_API_KEY')
  if (!league_external_id) throw new ApiError(400, 'Missing league_external_id')
  const headers = { 'X-Auth-Token': token }
  const url = `https://api.football-data.org/v4/competitions/${league_external_id}/teams`
  try {
    const res = await axios.get(url, { headers })
    const list = Array.isArray(res.data.teams) ? res.data.teams : []
    return list.map(t => ({
      external_team_id: t.id != null ? String(t.id) : null,
      club_name: t.name || null,
      club_img: t.crest || null,
      country: t.area?.name || null,
    }))
  } catch (err) {
    throw new ApiError(502, 'Provider football-data teams request failed', err)
  }
}

async function fetchSquadByTeam({ team_external_id }) {
  const token = process.env.FOOTBALL_DATA_API_KEY
  if (!token) throw new ApiError(500, 'Missing FOOTBALL_DATA_API_KEY')
  if (!team_external_id) throw new ApiError(400, 'Missing team_external_id')
  const headers = { 'X-Auth-Token': token }
  const url = `https://api.football-data.org/v4/teams/${team_external_id}`
  try {
    const res = await axios.get(url, { headers })
    const squad = Array.isArray(res.data.squad) ? res.data.squad : []
    return squad.map(m => ({
      external_player_id: m.id != null ? String(m.id) : null,
      player_name: m.name || null,
      player_nationality: m.nationality || res.data.area?.name || null,
      player_date_of_birth: m.dateOfBirth || null,
      position: m.position || null,
      number: m.shirtNumber || null,
      player_img: null,
    }))
  } catch (err) {
    throw new ApiError(502, 'Provider football-data team squad request failed', err)
  }
}

module.exports = { fetchFixtures, fetchTeams, fetchSquadByTeam }
