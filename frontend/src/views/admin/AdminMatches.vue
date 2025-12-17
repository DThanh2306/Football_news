<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Matches</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Match Management</h1>
      <div class="flex gap-2">
        <a-button type="primary" class="bg-green-600 border-green-600" @click="openImport">
          Import from provider
        </a-button>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 items-center mb-4">
        <a-input
          v-model:value="keyword"
          placeholder="Search teams, round"
          class="w-40"
          allow-clear
        >
          <template #prefix>
            <i class="ri-search-line text-gray-500"></i>
          </template>
        </a-input>
        <a-select v-model:value="status" placeholder="Status" allow-clear class="w-36">
          <a-select-option value="scheduled">scheduled</a-select-option>
          <a-select-option value="live">live</a-select-option>
          <a-select-option value="ft">ft</a-select-option>
          <a-select-option value="postponed">postponed</a-select-option>
          <a-select-option value="canceled">canceled</a-select-option>
        </a-select>
        <a-select v-model:value="leagueId" placeholder="League" allow-clear class="w-40">
          <a-select-option v-for="l in leagues" :key="l.league_id" :value="l.league_id">{{ l.league_name }}</a-select-option>
        </a-select>
        <a-select v-model:value="seasonId" placeholder="Season" allow-clear class="w-40">
          <a-select-option v-for="s in seasons" :key="s.season_id" :value="s.season_id">{{ s.season_name || (s.start_date + ' - ' + s.end_date) }}</a-select-option>
        </a-select>
        <a-select v-model:value="teamId" placeholder="Team" allow-clear class="w-40">
          <a-select-option v-for="c in clubs" :key="c.club_id" :value="c.club_id">
            <div class="flex items-center gap-2">
              <img :src="c.club_img" class="w-5 h-5 object-contain rounded border" />
              <span>{{ c.club_name }}</span>
            </div>
          </a-select-option>
        </a-select>
        <a-range-picker v-model:value="dateRange" show-time :allowClear="true" class="w-72"/>
        <a-button @click="resetFilters">Reset</a-button>
      </div>
    <div class="overflow-auto border rounded-lg shadow-sm bg-white overflow-y-auto" style="max-height: calc(100vh - 220px)">
      <a-table
      :columns="computedColumns"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      row-key="match_id"
      bordered
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'home'">
          <div class="flex items-center gap-2">
            <img :src="record.home_img" alt="home" class="w-6 h-6 object-contain rounded border" />
            <span class="font-medium text-gray-800">{{ record.home_name }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'away'">
          <div class="flex items-center gap-2">
            <img :src="record.away_img" alt="away" class="w-6 h-6 object-contain rounded border" />
            <span class="font-medium text-gray-800">{{ record.away_name }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div class="flex gap-2">
            <a-button type="link" size="small" @click="openEdit(record)">Edit</a-button>
            <a-popconfirm title="Xóa trận này?" ok-text="Xóa" cancel-text="Hủy" @confirm="() => removeMatch(record)">
              <a-button type="link" danger size="small">Delete</a-button>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>
  </div>

    <!-- Import modal -->
    <a-modal v-model:open="importOpen" title="Import matches from provider" :footer="null" destroyOnClose>
      <div class="space-y-3">
        <a-alert type="info" message="This will fetch fixtures from the selected provider and upsert into your database." show-icon />
        <a-form :model="importForm" layout="vertical">
          <a-form-item label="Provider" required>
            <a-select v-model:value="importForm.provider" placeholder="Select provider">
              <a-select-option value="football-data">football-data</a-select-option>
              <a-select-option value="api-football">api-football</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Country (optional)">
            <a-select v-model:value="importForm.country" placeholder="Country" allow-clear>
              <a-select-option v-for="c in countries" :key="c" :value="c">{{ c }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="League (internal, optional)">
            <a-select v-model:value="importForm.league_id" placeholder="League" allow-clear>
              <a-select-option v-for="l in leagues" :key="l.league_id" :value="l.league_id">{{ l.league_name }}</a-select-option>
        </a-select>
          </a-form-item>
          <a-form-item label="Date range">
            <a-range-picker v-model:value="importDateRange" />
          </a-form-item>
          <a-form-item label="League external id (provider)">
            <a-input v-model:value="importForm.league_external_id" placeholder="e.g. PL (football-data) or 39 (API-FOOTBALL)" />
          </a-form-item>
          <div class="flex justify-end gap-2">
            <a-button @click="importOpen=false">Cancel</a-button>
            <a-button type="primary" class="bg-green-600 border-green-600" :loading="importLoading" @click="doImport">Import</a-button>
          </div>
        </a-form>
      </div>
    </a-modal>

    <!-- Edit score modal -->
    <a-modal v-model:open="editOpen" title="Cập nhật tỉ số" :footer="null" destroyOnClose>
      <div v-if="current">
        <div class="mb-3 text-sm text-gray-600">{{ current.home_name }} vs {{ current.away_name }}</div>
        <div class="flex items-center gap-3 mb-4">
          <a-input-number v-model:value="form.home_score" :min="0" />
          <span>-</span>
          <a-input-number v-model:value="form.away_score" :min="0" />
          <a-select v-model:value="form.status" class="w-40">
            <a-select-option value="scheduled">scheduled</a-select-option>
            <a-select-option value="live">live</a-select-option>
            <a-select-option value="ft">ft</a-select-option>
            <a-select-option value="postponed">postponed</a-select-option>
            <a-select-option value="canceled">canceled</a-select-option>
          </a-select>
        </div>
        <div class="flex justify-end gap-2">
          <a-button @click="editOpen=false">Hủy</a-button>
          <a-button type="primary" class="bg-blue-600 border-blue-600" @click="saveScore">Lưu</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/vue-query'
import { matchesService } from '@/services/matches.service'
import { message } from 'ant-design-vue'
import { leaguesService } from '@/services/leagues.service'
import { seasonsService } from '@/services/seasons.service'
import { clubsService } from '@/services/clubs.service'

// Filters & pagination
const pagination = ref({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50'] })
const keyword = ref('')
const debouncedKeyword = ref('')
let keywordTimer
watch(keyword, (v) => {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => {
    debouncedKeyword.value = v
    pagination.value.current = 1
  }, 300)
})
onBeforeUnmount(() => clearTimeout(keywordTimer))

const status = ref()
const leagueId = ref()
const seasonId = ref()
const dateRange = ref([])

const leagues = ref([])
const seasons = ref([])
const clubs = ref([])
const teamId = ref()
const country = ref()
const countries = ref([])

watch([leagueId, country], async ([l, c]) => {
  try {
    const res = await clubsService.getAllClubs({ league_id: l, country: c })
    clubs.value = res.data
  } catch (e) { console.error('Failed to load clubs', e) }
})

watch(country, async (c) => {
  try {
    const res = await leaguesService.getAllLeagues(c ? { country: c } : {})
    leagues.value = res.data
    leagueId.value = undefined
    teamId.value = undefined
  } catch (e) { console.error('Failed to load leagues', e) }
})

// preload dropdowns
;(async () => {
  try {
    const [ls, ss, cs] = await Promise.all([
      leaguesService.getAllLeagues(),
      seasonsService.getAllSeasons(),
      clubsService.getAllClubs(),
    ])
    leagues.value = ls.data
    seasons.value = ss.data
    // derive distinct countries from clubs
    const list = (cs.data || []).map(x => x.country).filter(Boolean)
    countries.value = Array.from(new Set(list)).sort()
  } catch (e) { console.error('Failed to load base data', e) }
})()

const sortField = ref('match_date')
const sortOrder = ref('descend')

const dateFrom = computed(() => dateRange.value?.[0] ? dayjs(dateRange.value[0]).toISOString() : undefined)
const dateTo = computed(() => dateRange.value?.[1] ? dayjs(dateRange.value[1]).toISOString() : undefined)

// Columns
const computedColumns = computed(() => [
  { title: 'Ngày/giờ', dataIndex: 'match_date', key: 'match_date', sorter: true, sortOrder: sortField.value==='match_date'?sortOrder.value:null, customRender: ({ text }) => text ? dayjs(text).format('HH:mm DD/MM/YYYY') : '' },
  { title: 'Chủ nhà', key: 'home' },
  { title: 'Tỉ số', key: 'score', customRender: ({ record }) => `${record.home_score ?? 0} - ${record.away_score ?? 0}` },
  { title: 'Đội khách', key: 'away' },
  { title: 'Vòng', dataIndex: 'round', key: 'round' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  { title: 'Thao tác', key: 'actions' }
])

// Query
const queryKey = computed(() => [
  'matches',
  pagination.value.current,
  pagination.value.pageSize,
  debouncedKeyword.value,
  status.value,
  country.value,
  leagueId.value,
  seasonId.value,
  teamId.value,
  dateFrom.value,
  dateTo.value,
  sortField.value,
  sortOrder.value,
])

const query = useQuery({
  queryKey,
  queryFn: async () => {
    const res = await matchesService.getAllMatches({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      q: debouncedKeyword.value,
      status: status.value,
      country: country.value,
      league_id: leagueId.value,
      season_id: seasonId.value,
      team_id: teamId.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
      sort: sortField.value,
      order: sortOrder.value === 'ascend' ? 'asc' : 'desc',
    })
    return res.data
  },
  keepPreviousData: true,
})

const data = computed(() => query.data.value?.items ?? [])
const loading = computed(() => query.isLoading.value || query.isFetching.value)
watch(() => query.data.value, (val) => {
  if (val?.pagination?.total != null) {
    pagination.value.total = val.pagination.total
  }
})

function handleTableChange(pag, filters, sorter) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  if (sorter?.field) {
    sortField.value = sorter.field
    sortOrder.value = sorter.order || null
  }
}

function resetFilters() {
  keyword.value = ''
  debouncedKeyword.value = ''
  status.value = undefined
  country.value = undefined
  leagueId.value = undefined
  seasonId.value = undefined
  teamId.value = undefined
  dateRange.value = []
  pagination.value.current = 1
}

// Import modal state
const importOpen = ref(false)
const importLoading = ref(false)
const importForm = ref({ provider: undefined, league_external_id: '', league_id: undefined, country: undefined })
const importDateRange = ref([])
const importLeagues = ref([])

watch(() => importForm.value.country, async (c) => {
  try {
    const res = await leaguesService.getAllLeagues(c ? { country: c } : {})
    importLeagues.value = res.data
    importForm.value.league_id = undefined
  } catch (e) { console.error('Failed to load leagues for import', e) }
})

function openImport() {
  importOpen.value = true
}

async function doImport() {
  try {
    importLoading.value = true
    const [from, to] = importDateRange.value || []
    const payload = {
      provider: importForm.value.provider,
      date_from: from ? dayjs(from).format('YYYY-MM-DD') : undefined,
      date_to: to ? dayjs(to).format('YYYY-MM-DD') : undefined,
      league_external_id: importForm.value.league_external_id || undefined,
      league_id: importForm.value.league_id || undefined,
      country: importForm.value.country || undefined,
    }
    const res = await matchesService.importMatches(payload)
    message.success(`Imported: ${res.data?.created ?? 0} created, ${res.data?.updated ?? 0} updated`)
    importOpen.value = false
    await query.refetch()
  } catch (e) {
    console.error('Import failed', e)
    message.error('Import failed')
  } finally {
    importLoading.value = false
  }
}

// Edit score modal
const editOpen = ref(false)
const current = ref(null)
const form = ref({ home_score: 0, away_score: 0, status: 'scheduled' })

function openEdit(record) {
  current.value = { ...record }
  form.value = {
    home_score: record.home_score ?? 0,
    away_score: record.away_score ?? 0,
    status: record.status || 'scheduled'
  }
  editOpen.value = true
}

async function saveScore() {
  try {
    await matchesService.updateScore(current.value.match_id, form.value)
    editOpen.value = false
    await query.refetch()
  } catch (e) {
    console.error('Update score failed', e)
  }
}

async function removeMatch(record) {
  try {
    await matchesService.deleteMatch(record.match_id)
    message.success('Đã xóa')
    await query.refetch()
  } catch (e) {
    console.error('Delete failed', e)
    message.error('Xóa thất bại')
  }
}

</script>