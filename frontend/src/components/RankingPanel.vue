<template>
  <div class="bg-white rounded-xl shadow p-4">
    <h3 class="text-lg font-bold text-blue-700">Scoreboard</h3>
    <div class="flex items-center justify-between mb-3">
      
      <div class="flex items-center gap-2">
        <select v-model="selectedSlug" class="border rounded px-2 py-1 text-sm">
          <option :value="''">Choose League</option>
          <option v-for="l in leagues" :key="l.league_id" :value="l.league_slug">{{ l.league_name }}</option>
        </select>
        <select v-model.number="selectedSeason" class="border rounded px-2 py-1 text-sm" :disabled="!seasons.length">
          <option :value="0">Season</option>
          <option v-for="s in seasons" :key="s.season_id" :value="s.season_id">{{ s.name }}</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 8" :key="i" class="h-6 bg-gray-100 animate-pulse rounded"></div>
    </div>
    <div v-else>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-slate-500 border-b">
            <th class="text-left py-2">#</th>
            <th class="text-left py-2">Team</th>
            <th class="text-right py-2">Played</th>
            <th class="text-right py-2">Won</th>
            <th class="text-right py-2">Draw</th>
            <th class="text-right py-2">Lost</th>
            <th class="text-right py-2">GD</th>
            <th class="text-right py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.club_id" class="border-b hover:bg-gray-50">
            <td class="py-1">{{ r.position }}</td>
            <td class="py-1 flex items-center gap-2">
              <img :src="r.club_img || defaultImg" class="w-5 h-5 object-contain" />
              <span class="truncate">{{ r.club_name }}</span>
            </td>
            <td class="py-1 text-right">{{ r.played }}</td>
            <td class="py-1 text-right">{{ r.won }}</td>
            <td class="py-1 text-right">{{ r.draw }}</td>
            <td class="py-1 text-right">{{ r.lost }}</td>
            <td class="py-1 text-right">{{ r.gd }}</td>
            <td class="py-1 text-right font-semibold">{{ r.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '@/utils/axios'
import { leaguesService } from '@/services/leagues.service'
import { seasonsService } from '@/services/seasons.service'

const props = defineProps({
  leagueSlug: { type: String, default: '' }
})

const leagues = ref([])
const selectedSlug = ref('')
const seasons = ref([])
const selectedSeason = ref(0)
const rows = ref([])
const loading = ref(false)
const defaultImg = 'https://via.placeholder.com/24'

async function fetchLeagues() {
  try {
    const res = await leaguesService.getAllLeagues()
    leagues.value = Array.isArray(res?.data) ? res.data : res
  } catch { leagues.value = [] }
}

async function fetchSeasonsForLeague() {
  seasons.value = []
  selectedSeason.value = 0
  const league = leagues.value.find(l => l.league_slug === selectedSlug.value)
  if (!league) return
  try {
    const all = await seasonsService.getAllSeasons()
    const items = Array.isArray(all?.data) ? all.data : all
    seasons.value = (items || []).filter(s => s.league_id === league.league_id)
  } catch {
    seasons.value = []
  }
}

async function fetchStandings() {
  try {
    loading.value = true
    rows.value = []
    const league = leagues.value.find(l => l.league_slug === selectedSlug.value)
    if (!league) { loading.value = false; return }
    const params = { league_id: league.league_id }
    if (selectedSeason.value) params.season_id = selectedSeason.value
    const res = await axios.get('/standings', { params })
    rows.value = res?.data?.data || []
  } finally { loading.value = false }
}

watch(selectedSlug, async () => { await fetchSeasonsForLeague(); await fetchStandings() })
watch(selectedSeason, fetchStandings)

onMounted(async () => {
  await fetchLeagues()
  selectedSlug.value = props.leagueSlug || leagues.value[0]?.league_slug || ''
  await fetchSeasonsForLeague()
  await fetchStandings()
})
</script>
