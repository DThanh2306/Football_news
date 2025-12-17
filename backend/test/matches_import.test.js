const test = require('node:test')
const assert = require('node:assert')

// Prepare environment
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'

// Stub provider to avoid external HTTP
const footballProviderPath = require('path').resolve(__dirname, '../src/modules/providers/footballData.provider.js')
require.cache[footballProviderPath] = { exports: { fetchFixtures: async () => ([{
  external_id: 'fx1',
  match_date: new Date().toISOString(),
  status: 'scheduled',
  round: 'MD 1',
  home_team_name: 'Dummy Home',
  away_team_name: 'Dummy Away',
}]) } }

// Minimal knex mock for matches insert path
let lastInserted = []
let lastUpdated = []
const mockColumnInfo = {
  match_id: {},
  home_fc_id: {},
  away_fc_id: {},
  league_id: {},
  season_id: {},
  match_date: {},
  round: {},
  status: {},
  home_score: {},
  away_score: {},
}

function createQuery(table) {
  const api = {
    _where: null,
    columnInfo: async () => mockColumnInfo,
    where(cond) { this._where = cond; return this },
    first: async () => null, // ensure insert path
    update: async (data) => { lastUpdated.push({ table, where: this._where, data }); return 1 },
    insert: async (data) => { lastInserted.push({ table, data }); return [ { match_id: 1 } ] },
    del: async () => 1,
  }
  return api
}

const knexPath = require('path').resolve(__dirname, '../src/database/knex.js')
require.cache[knexPath] = { exports: (table) => createQuery(table) }

// Now load the service with mocks in place
const svc = require('../src/services/matches.service')

test('importMatchesFromProvider inserts without null home/away ids (lets DB defaults apply)', async () => {
  lastInserted = []
  const res = await svc.importMatchesFromProvider({ provider: 'football-data', date_from: '2025-01-01', date_to: '2025-01-02' })
  assert.strictEqual(res.provider, 'football-data')
  assert.strictEqual(res.total, 1)
  assert.strictEqual(res.created, 1)
  assert.ok(lastInserted.length === 1, 'should insert one row')
  const payload = lastInserted[0].data
  assert.ok(!('home_fc_id' in payload), 'home_fc_id should be omitted when null to use DB default')
  assert.ok(!('away_fc_id' in payload), 'away_fc_id should be omitted when null to use DB default')
  assert.ok('match_date' in payload, 'match_date present')
})
