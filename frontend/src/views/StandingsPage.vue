<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3 flex-wrap">
      <h1 class="text-xl font-bold text-blue-700">Bảng xếp hạng</h1>
      <a-select v-model:value="selectedLeague" class="min-w-60" :options="leagueOptions" placeholder="Chọn giải" />
      <a-select v-model:value="selectedSeason" class="min-w-60" :options="seasonOptions" placeholder="Chọn mùa" :disabled="!seasonOptions.length" />
    </div>

    <div class="bg-white rounded-xl shadow p-4">
      <a-table :dataSource="rows" :columns="columns" :pagination="false" rowKey="club_id" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '@/utils/axios'
import { leaguesService } from '@/services/leagues.service'
import { seasonsService } from '@/services/seasons.service'

const leagues = ref([])
const leagueOptions = ref([])
const selectedLeague = ref(null)

const seasons = ref([])
const seasonOptions = ref([])
const selectedSeason = ref(null)

const rows = ref([])

const columns = [
  { title: '#', dataIndex: 'position', key: 'position', width: 60 },
  { title: 'Đội', dataIndex: 'club_name', key: 'club_name',
    customRender: ({ text, record }) => {
      return {
        children: (
          <div class="flex items-center gap-2">
            <img src={record.club_img || 'https://via.placeholder.com/20'} class="w-5 h-5 object-contain" />
            <span>{text}</span>
          </div>
        )
      }
    }
  },
  { title: 'Tr', dataIndex: 'played', key: 'played', align: 'right', width: 70 },
  { title: 'Th', dataIndex: 'won', key: 'won', align: 'right', width: 70 },
  { title: 'H', dataIndex: 'draw', key: 'draw', align: 'right', width: 70 },
  { title: 'B', dataIndex: 'lost', key: 'lost', align: 'right', width: 70 },
  { title: 'HS', dataIndex: 'gd', key: 'gd', align: 'right', width: 70 },
  { title: 'Điểm', dataIndex: 'points', key: 'points', align: 'right', width: 80 },
]

async function loadLeagues() {
  const res = await leaguesService.getAllLeagues()
  leagues.value = Array.isArray(res?.data) ? res.data : res
  leagueOptions.value = leagues.value.map(l => ({ label: l.league_name, value: l.league_id }))
  if (!selectedLeague.value && leagueOptions.value.length) selectedLeague.value = leagueOptions.value[0].value
}

async function loadSeasons() {
  const all = await seasonsService.getAllSeasons()
  const list = Array.isArray(all?.data) ? all.data : all
  const filtered = list.filter(s => s.league_id === selectedLeague.value)
  seasons.value = filtered
  seasonOptions.value = filtered.map(s => ({ label: s.name, value: s.season_id }))
  selectedSeason.value = seasonOptions.value[0]?.value || null
}

async function loadStandings() {
  if (!selectedLeague.value) return
  const params = { league_id: selectedLeague.value }
  if (selectedSeason.value) params.season_id = selectedSeason.value
  const res = await axios.get('/standings', { params })
  rows.value = res?.data?.data || []
}

watch(selectedLeague, async () => { await loadSeasons(); await loadStandings() })
watch(selectedSeason, loadStandings)

onMounted(async () => {
  await loadLeagues()
  await loadSeasons()
  await loadStandings()
})
</script>
