<template>
  <div class="p-6 overflow-x-hidden">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Clubs</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Manage Clubs</h1>

      <div class="flex items-center gap-2">
        <a-input-search
          v-model:value="search"
          placeholder="Search clubs..."
          allow-clear
          enter-button
          style="width: 260px"
          @search="filterData"
        />
        <a-button @click="refresh" :loading="loading">Refresh</a-button>
        <a-button
          type="primary"
          class="bg-blue-600 border-blue-600"
          @click="openAddImport"
        >
          Thêm / Import
        </a-button>
      </div>
    </div>

    <div
      class="border rounded-lg shadow-sm bg-white overflow-y-auto overflow-x-hidden"
      style="max-height: calc(100vh - 170px)"
    >
      <a-table
        :columns="columns"
        :data-source="sortedData"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10','20','50'], showTotal: (t) => `Total ${t}` }"
        row-key="club_id"
        bordered
        class="rounded-none"
        @change="handleTableChange"
      >
      <template #bodyCell="{ column, record }">
        <!-- Logo -->
        <template v-if="column.key === 'img'">
          <div class="flex justify-center">
            <img
              v-if="record.club_img"
              :src="record.club_img"
              alt="logo"
              class="w-12 h-12 object-contain rounded-md border shadow-sm hover:scale-105 transition"
            />
          </div>
        </template>

        <!-- Badge giải đấu -->
        <template v-if="column.key === 'leagues'">
          <template v-if="Array.isArray(record.leagues) && record.leagues.length">
            <span v-for="lg in record.leagues" :key="lg.league_id" class="mr-1 mb-1 inline-block px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
               {{ lg.league_name }}
            </span>
          </template>
          <template v-else>
            <span class="px-2 py-1 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200">Unmapped</span>
          </template>
        </template>

        <!-- Badge quốc gia -->
        <template v-if="column.key === 'country'">
          <span class="px-2 py-1 text-xs rounded bg-green-50 text-green-700 border border-green-200">
            {{ record.country }}
          </span>
        </template>

        <!-- Xem cầu thủ -->
        <template v-if="column.key === 'player_actions'">
          <a-button type="link" size="small" @click="goPlayers(record.club_id)">Xem</a-button>
        </template>

        <!-- Action -->
        <template v-if="column.key === 'actions'">
          <div class="flex gap-2 justify-center">
            <a-button type="link" size="small" @click="openEdit(record)">Sửa</a-button>

            <a-popconfirm
              title="Are you sure you want to delete this club?"
              ok-text="Delete"
              cancel-text="Hủy"
              @confirm="handleDelete(record.club_id)"
            >
              <a-button type="link" danger size="small">Delete</a-button>
            </a-popconfirm>
          </div>
        </template>
      </template>
      </a-table>
    </div>

    <!-- Unified Add / Import Modal -->
    <a-modal
      v-model:open="modalOpen"
      :title="activeTab === 'add' ? (isEdit ? 'Edit club' : 'Add club') : 'Import clubs from provider'"
      :footer="null"
      @cancel="resetForm"
      destroyOnClose
    >
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="add" tab="Thêm CLB">
          <a-form ref="formRef" :model="form" layout="vertical">
            <a-form-item label="Club name" name="club_name" :rules="[{ required: true, message: 'Please enter club name' }]">
              <a-input v-model:value="form.club_name" />
            </a-form-item>

            <a-form-item label="League" name="league_id" :rules="[{ required: true, message: 'Please select league' }]">
              <a-select
                v-model:value="selectedLeagueId"
                :options="leagueOptions"
                placeholder="Select league"
                show-search
                option-filter-prop="label"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="Country" name="country" :rules="[{ required: true, message: 'Please enter country' }]">
              <a-input v-model:value="form.country" />
            </a-form-item>

            <a-form-item label="Club logo">
              <input type="file" accept="image/*" @change="onFileChange" />

              <div v-if="form.club_img" class="mt-3 flex justify-center">
                <img
                  :src="form.club_img"
                  alt="preview"
                  class="w-20 h-20 object-contain rounded border shadow-md"
                />
              </div>
            </a-form-item>

            <div class="flex justify-end gap-2">
              <a-button @click="resetForm">Cancel</a-button>
              <a-button type="primary" class="bg-blue-600 border-blue-600" :loading="submitting" @click="handleSubmit">Save</a-button>
            </div>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="import" tab="Import từ provider">
          <div class="space-y-3">
            <a-alert type="info" message="This will fetch clubs from the selected provider and upsert into your database." show-icon />
            <a-form :model="importForm" layout="vertical">
              <a-form-item label="Provider" required>
                <a-select v-model:value="importForm.provider" placeholder="Select provider">
                  <a-select-option value="football-data">football-data</a-select-option>
                  <a-select-option value="api-football">api-football</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="League (internal, optional)">
                <a-select v-model:value="importForm.league_id" placeholder="League" allow-clear :options="leagueOptions" show-search option-filter-prop="label" />
              </a-form-item>
              <a-form-item label="Season year (optional)">
                <a-input v-model:value="importForm.season_year" placeholder="e.g. 2024" />
              </a-form-item>
              <a-form-item label="League external id (provider)" required>
                <a-select
                  v-if="providerLeagues.length"
                  v-model:value="importForm.league_external_id"
                  show-search
                  allow-clear
                  placeholder="Select provider league (or type manually)"
                  :filter-option="(input, option) => option?.label?.toLowerCase?.().includes?.(input.toLowerCase())"
                  :options="providerLeagues"
                />
                <a-input v-else v-model:value="importForm.league_external_id" placeholder="e.g. PL (football-data) or 39 (API-FOOTBALL)" />
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="importForm.update_club_logos">Update club logos from provider (only if missing)</a-checkbox>
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="importForm.update_unmapped_clubs">Update unmapped clubs (match by name, attach external mapping)</a-checkbox>
              </a-form-item>
              <div class="flex justify-end gap-2">
                <a-button @click="resetForm">Cancel</a-button>
                <a-button type="primary" class="bg-green-600 border-green-600" :loading="importLoading" @click="doImport">Import</a-button>
              </div>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { clubsService } from '@/services/clubs.service'
import { leaguesService } from '@/services/leagues.service'
import { useRouter } from 'vue-router'

const search = ref("")
const data = ref([])
const filteredData = ref([])
const sortedData = ref([])
const sortField = ref()
const sortOrder = ref()
const router = useRouter()


const filterData = () => {
  const term = search.value.toLowerCase()
  filteredData.value = data.value.filter(c =>
    c.club_name?.toLowerCase().includes(term)
  )
  applySort()
}

const columns = [
  { title: 'Logo', dataIndex: 'club_img', key: 'img', width: 90, align: 'center' },
  { title: 'Tên đội', dataIndex: 'club_name', key: 'club_name', sorter: true },
  { title: 'Giải đấu', dataIndex: 'leagues', key: 'leagues', width: 220, sorter: true },
  { title: 'Quốc gia', dataIndex: 'country', key: 'country', width: 140, sorter: true },
  { title: 'Cầu thủ', key: 'player_actions', align: 'center', width: 100 },
  { title: 'Thao tác', key: 'actions', align: 'center', width: 120 }
]

const loading = ref(false)
const modalOpen = ref(false)
const activeTab = ref('add')
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()

// Import state
const importLoading = ref(false)
const importForm = ref({ provider: undefined, league_external_id: '', league_id: undefined, season_year: undefined, update_club_logos: false, update_unmapped_clubs: false })
const providerLeagues = ref([])

const form = ref({
  club_name: '',
  country: '',
  club_img: ''
})

const selectedLeagueId = ref(null)
const leagueOptions = ref([])

const fetchClubs = async () => {
  loading.value = true
  try {
    const res = await clubsService.getAllClubs()
    data.value = res?.data || res || []
    filteredData.value = data.value
    applySort()
  } catch {
    data.value = []
    filteredData.value = []
    sortedData.value = []
  } finally {
    loading.value = false
  }
}

const fetchLeagues = async () => {
  try {
    const res = await leaguesService.getAllLeagues()
    const list = res?.data || res || []
    leagueOptions.value = list.map(l => ({ label: l.league_name, value: l.league_id }))
  } catch {
    leagueOptions.value = []
  }
}

const openAddImport = () => {
  activeTab.value = 'add'
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', country: '', club_img: '' }
  selectedLeagueId.value = null
  modalOpen.value = true
}

const openEdit = (record) => {
  activeTab.value = 'add'
  isEdit.value = true
  editingId.value = record.club_id
  form.value = {
    club_name: record.club_name,
    country: record.country,
    club_img: record.club_img
  }
  selectedLeagueId.value = Array.isArray(record.leagues) && record.leagues.length ? record.leagues[0].league_id : null
  modalOpen.value = true
}
const goPlayers = (id) => {
  router.push(`/admin/clubs/${id}/players`)
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) form.value.club_img = await fileToBase64(file)
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      club_name: form.value.club_name,
      club_img: form.value.club_img,
      league_ids: selectedLeagueId.value ? [selectedLeagueId.value] : []
    }
    if (form.value.country) payload.country = form.value.country

    if (isEdit.value) {
      await clubsService.updateClub(editingId.value, payload)
      message.success('Cập nhật thành công!')
    } else {
      await clubsService.createClub(payload)
      message.success('Added successfully!')
    }
    modalOpen.value = false
    fetchClubs()
  } catch {
    message.error('Something went wrong!')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (id) => async () => {
  loading.value = true
  try {
    await clubsService.deleteClub(id)
    message.success('Club deleted!')
    fetchClubs()
  } catch {
    message.error('Delete failed!')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  modalOpen.value = false
  // keep activeTab state for next open
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', country: '', club_img: '' }
  selectedLeagueId.value = null
  importForm.value = { provider: undefined, league_external_id: '', league_id: undefined, season_year: undefined, update_club_logos: false, update_unmapped_clubs: false }
}

watch(() => importForm.value.provider, (p) => {
  if (p === 'football-data') {
    providerLeagues.value = [
      { value: 'PL', label: 'PL - Premier League (England)' },
      { value: 'BL1', label: 'BL1 - Bundesliga (Germany)' },
      { value: 'PD', label: 'PD - La Liga (Spain)' },
      { value: 'SA', label: 'SA - Serie A (Italy)' },
      { value: 'FL1', label: 'FL1 - Ligue 1 (France)' },
      { value: 'DED', label: 'DED - Eredivisie (Netherlands)' },
      { value: 'PPL', label: 'PPL - Primeira Liga (Portugal)' },
      { value: 'CL', label: 'CL - Champions League' },
      { value: 'EL', label: 'EL - Europa League' },
    ]
  } else if (p === 'api-football') {
    providerLeagues.value = [
      { value: '39', label: '39 - Premier League (England)' },
      { value: '78', label: '78 - Bundesliga (Germany)' },
      { value: '140', label: '140 - La Liga (Spain)' },
      { value: '135', label: '135 - Serie A (Italy)' },
      { value: '61', label: '61 - Ligue 1 (France)' },
      { value: '88', label: '88 - Eredivisie (Netherlands)' },
      { value: '94', label: '94 - Primeira Liga (Portugal)' },
      { value: '2', label: '2 - Champions League' },
      { value: '3', label: '3 - Europa League' },
    ]
  } else {
    providerLeagues.value = []
  }
})

async function doImport() {
  try {
    if (!importForm.value.provider || !importForm.value.league_external_id) {
      message.warning('Vui lòng chọn provider và nhập league external id')
      return
    }
    importLoading.value = true
    const payload = {
      provider: importForm.value.provider,
      league_external_id: importForm.value.league_external_id,
      league_id: importForm.value.league_id || undefined,
      season_year: importForm.value.season_year || undefined,
      update_club_logos: importForm.value.update_club_logos || false,
      update_unmapped_clubs: importForm.value.update_unmapped_clubs || false,
    }
    const res = await clubsService.importClubs(payload)
    message.success(`Imported: ${res.data?.created ?? 0} created, ${res.data?.updated ?? 0}`)
    modalOpen.value = false
    await fetchClubs()
  } catch (e) {
    console.error('Import failed', e)
    message.error('Import failed')
  } finally {
    importLoading.value = false
  }
}

function handleTableChange(pag, filters, sorter) {
  sortField.value = sorter?.field
  sortOrder.value = sorter?.order
  applySort()
}

function applySort() {
  const list = filteredData.value ? [...filteredData.value] : []
  if (sortField.value && sortOrder.value) {
    const dir = sortOrder.value === 'ascend' ? 1 : -1
    list.sort((a, b) => {
      const f = sortField.value
      if (f === 'club_name') {
        return (a.club_name || '').localeCompare(b.club_name || '') * dir
      }
      if (f === 'country') {
        return (a.country || '').localeCompare(b.country || '') * dir
      }
      if (f === 'leagues') {
        const la = Array.isArray(a.leagues) && a.leagues.length ? a.leagues[0].league_name : ''
        const lb = Array.isArray(b.leagues) && b.leagues.length ? b.leagues[0].league_name : ''
        return (la || '').localeCompare(lb || '') * dir
      }
      return 0
    })
  }
  sortedData.value = list
}

onMounted(async () => {
  await fetchClubs()
  await fetchLeagues()
})

const refresh = async () => {
  await fetchClubs()
  await fetchLeagues()
}
</script>
