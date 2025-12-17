<template>
  <aside class="sticky top-44 w-full flex-shrink-0">
    <div class="bg-white dark:bg-slate-900 border border-[rgb(var(--border))]/80 dark:border-slate-800 rounded-lg shadow-soft overflow-hidden mb-6 theme-transition">
      <div class="px-4 py-3 border-b bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-700 dark:text-slate-100 border-slate-200/60 dark:border-slate-800 theme-transition">
        Schedule
      </div>

      <div v-if="loading" class="p-4 space-y-3">
        <div class="animate-pulse h-6 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-20 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-6 bg-gray-100 rounded"></div>
        <div class="animate-pulse h-20 bg-gray-100 rounded"></div>
      </div>

      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>

      <div v-else>
        <div v-for="g in scheduleGroups" :key="g.id" class="border-b border-slate-200/60 dark:border-slate-800 last:border-b-0 theme-transition">
          <div class="px-4 py-2 text-center font-semibold bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 theme-transition">
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
              <span class="truncate text-right text-slate-700 dark:text-slate-200">{{ m.away.name }}</span>
              <img :src="m.away.logo" class="w-6 h-6 object-contain" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { matchesService } from '@/services/matches.service'

// state
const loading = ref(false)
const error = ref(null)
const scheduleGroups = ref([])


// helpers cần thiết
function pillClass(status) {
  if (status === 'scheduled') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'live') return 'bg-red-50 text-red-600 border border-red-200'
  return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
}
function safeScore(v) { return typeof v === 'number' ? v : '-' }


onMounted(loadAll)

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const route = (await import('vue-router')).useRoute?.() || null
    const activeSlug = route?.params?.slug
    const leaguesApi = (await import('@/utils/axios')).default.get('/leagues')
    // nếu có slug giải trên route, lọc theo giải đó, default: không lọc
    let leagueId = null
    try {
      const lr = await leaguesApi
      const ls = lr?.data?.data || []
      if (activeSlug) {
        const found = ls.find(l => l.league_slug === activeSlug)
        leagueId = found?.league_id || null
      }
    } catch (e) {
      console.warn('Không lấy được danh sách leagues', e)
    }

    const [leaguesRes, matchesRes, clubsRes] = await Promise.all([
      // Giữ nguyên axios cho 2 API còn lại để tránh thay đổi lớn
      (await import('@/utils/axios')).default.get('/leagues'),
      matchesService.getAllMatches({ pageSize: 20, sort: 'match_date', order: 'desc', league_id: leagueId || undefined }),
      (await import('@/utils/axios')).default.get('/clubs'),
    ])

    const leagues = leaguesRes?.data?.data || []
    const matches = Array.isArray(matchesRes?.items) ? matchesRes.items : (Array.isArray(matchesRes) ? matchesRes : [])
    const clubs   = clubsRes?.data?.data   || []

    const leagueById = new Map(leagues.map(l => [l.league_id, l]))
    const clubById   = new Map(clubs.map(c => [c.club_id, c]))

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
        const dt = row.match_date ? new Date(row.match_date) : null
        const hh = dt ? String(dt.getHours()).padStart(2,'0') : '--'
        const mm = dt ? String(dt.getMinutes()).padStart(2,'0') : '--'
        return {
          id: row.match_id,
          status: row.status || 'scheduled',
          time: `${hh}:${mm}`,
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
