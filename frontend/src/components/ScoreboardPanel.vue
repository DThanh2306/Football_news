<template>
  <aside class="sticky top-44 w-full lg:w-80 flex-shrink-0">
    <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div class="px-4 py-3 border-b bg-slate-100 text-center font-bold text-slate-700">
        LỊCH THI ĐẤU - KẾT QUẢ
      </div>

      <div v-if="loading" class="p-4 space-y-3">
        <div class="animate-pulse h-6 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-20 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-6 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-20 bg-gray-100 rounded"></div>
      </div>

      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>

      <div v-else>
        <div v-for="g in scheduleGroups" :key="g.id" class="border-b last:border-b-0">
          <div class="px-4 py-2 text-center font-semibold bg-slate-50 text-emerald-700">
            {{ g.title }}
          </div>

          <div v-for="m in g.matches" :key="m.id" class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2 min-w-0">
              <img :src="m.home.logo" class="w-6 h-6 object-contain" alt="" />
              <span class="truncate">{{ m.home.name }}</span>
            </div>

            <div class="min-w-[56px] px-2 py-1 text-sm font-bold rounded-md text-center" :class="pillClass(m.status)">
              <template v-if="m.status === 'scheduled'">{{ m.time }}</template>
              <template v-else>{{ safeScore(m.home.score) }} - {{ safeScore(m.away.score) }}</template>
            </div>

            <div class="flex items-center gap-2 min-w-0 justify-end">
              <span class="truncate text-right">{{ m.away.name }}</span>
              <img :src="m.away.logo" class="w-6 h-6 object-contain" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BẢNG XẾP HẠNG (dữ liệu cứng) -->
    <div class="bg-gray-50 rounded-lg shadow p-4">
      <h2 class="text-lg font-bold mb-2">BẢNG XẾP HẠNG</h2>
      <a-select v-model:value="selectedLeague" class="w-full mb-2" :options="leagueOptions" />
      <table class="w-full text-sm border-t">
        <thead>
          <tr>
            <th class="py-1 text-left">TT</th>
            <th class="py-1 text-left">Đội</th>
            <th class="py-1">Trận</th>
            <th class="py-1">HS</th>
            <th class="py-1">Điểm</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(team, idx) in (ranking[selectedLeague] || [])"
            :key="team.name"
            :class="idx % 2 ? 'bg-white' : 'bg-gray-50'"
          >
            <td>{{ idx + 1 }}</td>
            <td class="flex items-center gap-2">
              <img :src="team.logo" alt="logo" class="w-6 h-6 object-contain" />
              {{ team.name }}
            </td>
            <td class="text-center">{{ team.played }}</td>
            <td class="text-center">{{ team.hs }}</td>
            <td class="text-center">{{ team.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

// state
const loading = ref(false)
const error = ref(null)
const scheduleGroups = ref([])

const selectedLeague = ref('')       // dùng league_name
const leagueOptions = ref([])

// helpers cần thiết
function pillClass(status) {
  if (status === 'scheduled') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'live') return 'bg-red-50 text-red-600 border border-red-200'
  return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
}
function safeScore(v) { return typeof v === 'number' ? v : '-' }

// BXH cứng, key = league_name
const ranking = {
  'Premier League': [
    { name: 'Manchester United', logo: '/public/Manchester_United.svg', played: 8, hs: 18, points: 22 },
    { name: 'Arsenal', logo: '/public/Arsenal.svg', played: 8, hs: 15, points: 20 },
    { name: 'Chelsea', logo: '/public/Chelsea.svg', played: 8, hs: 12, points: 17 },
    { name: 'Brighton', logo: '/public/Brighton_&_Hove_Albion.svg', played: 8, hs: 9, points: 15 },
    { name: 'Aston Villa', logo: '/public/Aston_Villa.webp', played: 8, hs: 6, points: 13 },
    { name: 'Crystal Palace', logo: '/public/Crystal_Palace.svg', played: 8, hs: 4, points: 12 },
    { name: 'Brentford', logo: '/public/Brentford.webp', played: 8, hs: 2, points: 11 },
    { name: 'Fulham', logo: '/public/Fulham.svg', played: 8, hs: -1, points: 9 },
    { name: 'Bournemouth', logo: '/public/Bournemouth.svg', played: 8, hs: -5, points: 7 },
    { name: 'Burnley', logo: '/public/burnley.png', played: 8, hs: -10, points: 4 },
  ],
  'La Liga': [
    { name: 'Real Madrid', logo: '/upload/realmadrid.png', played: 0, hs: 0, points: 0 },
    { name: 'Barcelona', logo: '/upload/barcelona.png', played: 0, hs: 0, points: 0 },
    { name: 'Atletico Madrid', logo: '/upload/atleticomadrid.png', played: 0, hs: 0, points: 0 },
    { name: 'Sevilla', logo: '/upload/sevilla.png', played: 0, hs: 0, points: 0 },
    { name: 'Valencia', logo: '/upload/valencia.png', played: 0, hs: 0, points: 0 },
  ],
  'Serie A': [
    { name: 'Juventus', logo: '/upload/juventus.png', played: 0, hs: 0, points: 0 },
    { name: 'AC Milan', logo: '/upload/acmilan.png', played: 0, hs: 0, points: 0 },
    { name: 'Inter Milan', logo: '/upload/intermilan.png', played: 0, hs: 0, points: 0 },
    { name: 'Napoli', logo: '/upload/napoli.png', played: 0, hs: 0, points: 0 },
    { name: 'Roma', logo: '/upload/roma.png', played: 0, hs: 0, points: 0 },
  ],
}

onMounted(loadAll)

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const [leaguesRes, matchesRes, clubsRes] = await Promise.all([
      axios.get('/leagues'),
      axios.get('/matches'),
      axios.get('/clubs'),
    ])

    const leagues = leaguesRes?.data?.data || []
    const matches = matchesRes?.data?.data || []
    const clubs   = clubsRes?.data?.data   || []

    const leagueById = new Map(leagues.map(l => [l.league_id, l]))
    const clubById   = new Map(clubs.map(c => [c.club_id, c]))

    // options & default selected (league_name)
    leagueOptions.value = leagues.map(l => ({ label: l.league_name, value: l.league_name }))
    if (!selectedLeague.value && leagueOptions.value.length) {
      selectedLeague.value = leagueOptions.value[0].value
    }

    // group by league_id
    const groups = new Map()
    for (const m of matches) {
      const lid = m.league_id
      if (!groups.has(lid)) groups.set(lid, [])
      groups.get(lid).push(m)
    }

    // map to UI
    scheduleGroups.value = Array.from(groups.entries()).map(([lid, list]) => {
      const league = leagueById.get(lid)
      const title = league ? league.league_name : `League ${lid}`

      const mapped = list.map(row => {
        const home = clubById.get(row.home_fc_id)
        const away = clubById.get(row.away_fc_id)
        return {
          id: row.match_id,
          status: row.status || 'scheduled',
          time: '--:--',
          home: {
            id: row.home_fc_id,
            name: home?.club_name || `Club ${row.home_fc_id}`,
            logo: home?.club_img || '/placeholder.png',
            score: row.home_score ?? null,
          },
          away: {
            id: row.away_fc_id,
            name: away?.club_name || `Club ${row.away_fc_id}`,
            logo: away?.club_img || '/placeholder.png',
            score: row.away_score ?? null,
          },
        }
      })

      return { id: String(lid), title, matches: mapped }
    })
  } catch (e) {
    error.value = e?.message || 'Lỗi khi tải dữ liệu'
  } finally {
    loading.value = false
  }
}
</script>
