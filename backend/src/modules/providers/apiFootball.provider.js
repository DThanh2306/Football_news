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

module.exports = { fetchFixtures }
