<template>
  <div class="min-h-screen py-4 px-4 bg-[rgb(var(--bg))] theme-transition">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
      <!-- Sidebar filters -->
      <aside class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-soft p-4 space-y-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Bộ lọc</h2>
        <label class="block text-sm mb-1 text-slate-600 dark:text-slate-300">Giải đấu</label>
        <select v-model="selectedSlug" class="w-full border border-slate-300/70 dark:border-slate-700 rounded px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
          <option :value="''">Tất cả</option>
          <option v-for="l in leagues" :key="l.league_id" :value="l.league_slug">{{ l.league_name }}</option>
        </select>
        <label class="block text-sm mb-1 text-slate-600 dark:text-slate-300">Ngày</label>
        <input type="date" v-model="selectedDate" class="w-full border border-slate-300/70 dark:border-slate-700 rounded px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
      </aside>

      <!-- Main content -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Lịch thi đấu</h1>
          <div class="text-sm text-slate-600 dark:text-slate-400">{{ subtitle }}</div>
        </div>

        <div v-if="loading" class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl animate-pulse"></div>
        </div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else>
          <div v-for="g in groups" :key="g.id" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-soft overflow-hidden mb-4">
            <div class="px-4 py-2 text-center font-semibold bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400">{{ g.title }}</div>
            <div v-for="m in g.matches" :key="m.id" class="flex items-center justify-between px-4 py-3 border-t border-slate-200/60 dark:border-slate-800">
              <div class="flex items-center gap-2 min-w-0">
                <img :src="m.home.logo" class="w-6 h-6 object-contain" alt="" />
                <span class="truncate">{{ m.home.name }}</span>
              </div>
              <div class="min-w-[56px] px-2 py-1 text-sm font-bold rounded-md text-center" :class="pillClass(m.status)">
                <template v-if="m.status === 'scheduled'">{{ m.time }}</template>
                <template v-else>{{ safeScore(m.home.score) }} - {{ safeScore(m.away.score) }}</template>
              </div>
              <div class="flex items-center gap-2 min-w-0 justify-end">
                <span class="truncate text-right text-slate-700 dark:text-slate-200">{{ m.away.name }}</span>
                <img :src="m.away.logo" class="w-6 h-6 object-contain" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { matchesService } from '@/services/matches.service'
import { leaguesService } from '@/services/leagues.service'
import axios from '@/utils/axios'

const route = useRoute()

const leagues = ref([])
const selectedSlug = ref('')
const selectedDate = ref(new Date().toISOString().slice(0,10))
const loading = ref(false)
const error = ref('')
const groups = ref([])

const subtitle = computed(() => {
  const date = selectedDate.value
  const league = leagues.value.find(l => l.league_slug === selectedSlug.value)
  return [league?.league_name, date].filter(Boolean).join(' • ')
})

function pillClass(status) {
  if (status === 'scheduled') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'live') return 'bg-red-50 text-red-600 border border-red-200'
  return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
}
function safeScore(v) { return typeof v === 'number' ? v : '-' }

async function fetchLeagues() {
  try {
    const res = await leaguesService.getAllLeagues()
    leagues.value = Array.isArray(res?.data) ? res.data : res
  } catch {
    leagues.value = []
  }
}

async function loadSchedule() {
  loading.value = true
  error.value = ''
  groups.value = []
  try {
    const league = leagues.value.find(l => l.league_slug === selectedSlug.value)
    const params = { pageSize: 50, sort: 'match_date', order: 'asc' }
    if (league) params.league_id = league.league_id

    const [matchesRes, clubsRes, leaguesRes] = await Promise.all([
      matchesService.getAllMatches(params),
      axios.get('/clubs'),
      axios.get('/leagues'),
    ])

    const matches = Array.isArray(matchesRes?.items) ? matchesRes.items : (Array.isArray(matchesRes) ? matchesRes : [])
    const clubs   = clubsRes?.data?.data || []
    const leaguesMap = new Map((leaguesRes?.data?.data || []).map(l => [l.league_id, l]))
    const clubById   = new Map(clubs.map(c => [c.club_id, c]))

    const byLeague = new Map()
    for (const m of matches) {
      const lid = m.league_id
      if (!byLeague.has(lid)) byLeague.set(lid, [])
      byLeague.get(lid).push(m)
    }

    groups.value = Array.from(byLeague.entries()).map(([lid, list]) => {
      const league = leaguesMap.get(lid)
      const title = league ? league.league_name : `League ${lid}`
      const mapped = list.map(row => {
        const home = clubById.get(row.home_fc_id)
        const away = clubById.get(row.away_fc_id)
        const dt = row.match_date ? new Date(row.match_date) : null
        const hh = dt ? String(dt.getHours()).padStart(2,'0') : '--'
        const mm = dt ? String(dt.getMinutes()).padStart(2,'0') : '--'
        return {
          id: row.match_id,
          status: row.status || 'scheduled',
          time: `${hh}:${mm}`,
          home: { id: row.home_fc_id, name: home?.club_name || `Club ${row.home_fc_id}`, logo: home?.club_img || '/placeholder.png', score: row.home_score ?? null },
          away: { id: row.away_fc_id, name: away?.club_name || `Club ${row.away_fc_id}`, logo: away?.club_img || '/placeholder.png', score: row.away_score ?? null },
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

onMounted(async () => {
  await fetchLeagues()
  // Init from query ?league
  const qLeague = route.query.league
  if (typeof qLeague === 'string') selectedSlug.value = qLeague
  await loadSchedule()
})

watch([selectedSlug, selectedDate], loadSchedule)
</script>
