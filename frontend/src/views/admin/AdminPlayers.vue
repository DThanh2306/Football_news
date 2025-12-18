<template>
  <div class="p-6">

    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Player</a-breadcrumb-item>
    </a-breadcrumb>

    <div v-if="clubName" class="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-4">
      <img v-if="clubLogo" :src="clubLogo" class="w-14 h-14 object-contain rounded shadow" />
      <div>
        <h2 class="text-xl font-bold text-blue-700">{{ clubName }}</h2>
        <p class="text-gray-600 text-sm">Total: {{ data.length }} Player</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div class="flex items-center gap-3">
        <i class="ri-user-star-line text-2xl text-blue-600"></i>
        <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Player Management</h1>
      </div>
      <div class="flex-1"></div>
      <div>
        <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openAddImport">Add / Import</a-button>
      </div>
    </div>

    <!-- Toolbar: Search & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
      <a-input-search v-model:value="search" placeholder="Search player name" @search="filterData" @change="filterData" />
      <a-select v-model:value="filterClub" :options="clubOptions" allow-clear show-search option-filter-prop="label" placeholder="Filter by club" @change="filterData" />
      <a-select v-model:value="filterPosition" :options="positionOptions" allow-clear show-search option-filter-prop="label" placeholder="Filter by position" @change="filterData" />
      <a-select v-model:value="filterNationality" :options="nationalityOptions" allow-clear show-search option-filter-prop="label" placeholder="Filter by nationality" @change="filterData" />
    </div>

    <div class="border rounded-lg shadow-sm bg-white overflow-y-auto overflow-x-hidden"
      style="max-height: calc(100vh - 220px)">
      <a-table
        :columns="columns"
        :data-source="sortedData"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10','20','50'], showTotal: (t) => `Total ${t}` }"
        row-key="player_id"
        bordered
        class="rounded-xl shadow-sm min-w-[900px]"
        :scroll="{ x: true }"
        @change="handleTableChange"
      >
      <template #bodyCell="{ column, record }">

        <!-- Avatar -->
        <template v-if="column.key === 'avatar'">
          <div class="flex justify-center">
            <img
              v-if="record.avatar"
              :src="record.avatar"
              alt="avatar"
              class="w-10 h-10 object-cover rounded-full border shadow"
              @error="(e) => { e.target.style.display='none' }"
            />
            <div v-else class="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">N/A</div>
          </div>
        </template>

        <!-- Club badge -->
        <template v-if="column.key === 'club'">
          <span class="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
            {{ record.club }}
          </span>
        </template>

        <!-- Actions -->
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="goDetail(record)">Details</a-button>
          <a-button type="link" size="small" @click="openEdit(record)">Edit</a-button>

          <a-popconfirm
            title="Are you sure you want to delete this player?"
            ok-text="Delete"
            cancel-text="cancel"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">Delete</a-button>
          </a-popconfirm>
        </template>

      </template>
    </a-table>

    <!-- Modal Thêm / Import -->
    <a-modal
      v-model:open="modalOpen"
      :title="activeTab === 'add' ? (isEdit ? 'Edit Player' : 'Add Player') : 'Import Players from Provider'"
      :footer="null"
      @cancel="resetModal"
      destroyOnClose
    >
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="add" tab="Add Player">
          <a-form layout="vertical">
            <a-form-item label="Player name">
              <a-input v-model:value="form.player_name" />
            </a-form-item>
            <a-form-item label="Nationality">
              <a-input v-model:value="form.player_nationality" />
            </a-form-item>
            <a-form-item label="Date of birth">
              <a-date-picker v-model:value="form.player_date_of_birth" style="width: 100%" />
            </a-form-item>
            <a-form-item label="Position">
              <a-input v-model:value="form.position" />
            </a-form-item>
            <a-form-item label="Additional information">
              <a-textarea v-model:value="form.player_infor" rows="3" />
            </a-form-item>
            <a-form-item label="Avatar">
              <input type="file" accept="image/*" @change="handleImageChange" />
            </a-form-item>
            <div class="flex justify-end gap-2">
              <a-button @click="resetModal">Cancel</a-button>
              <a-button type="primary" class="bg-blue-600 border-blue-600" @click="savePlayer">Save</a-button>
            </div>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="import" tab="Import from provider">
          <div class="space-y-3">
            <a-alert type="info" message="Import from provider" show-icon />
            <a-form :model="importForm" layout="vertical">
              <a-form-item label="Provider" required>
                <a-select v-model:value="importForm.provider" placeholder="Select provider">
                  <a-select-option value="football-data">football-data</a-select-option>
                  <a-select-option value="api-football">api-football</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="mode" required>
                <a-radio-group v-model:value="importForm.mode">
                  <a-radio value="club">Club</a-radio>
                  <a-radio value="league">League</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item v-if="importForm.mode==='club'" label="Club">
                <a-select v-model:value="importForm.club_id" placeholder="Club name" :options="clubOptions" show-search option-filter-prop="label" allow-clear />
              </a-form-item>
              <a-form-item v-else label="League">
                <a-select v-model:value="importForm.league_id" placeholder="League name" :options="leagueOptions" show-search option-filter-prop="label" allow-clear />
              </a-form-item>
              <a-form-item label="Season year (optional)">
                <a-input v-model:value="importForm.season_year" placeholder="e.g. 2024" />
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="importForm.update_only">Update only (no new players)</a-checkbox>
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="importForm.force_overwrite">Force overwrite nationality/avatar</a-checkbox>
              </a-form-item>
              <div class="flex justify-end gap-2">
                <a-button @click="resetModal">Cancel</a-button>
                <a-button type="primary" class="bg-green-600 border-green-600" :loading="importLoading" @click="doImport">Import</a-button>
              </div>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { playersService } from '@/services/players.service'
import { clubsService } from '@/services/clubs.service'
import { leaguesService } from '@/services/leagues.service'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const clubId = route.params.id || null
const clubName = ref(null)
const clubLogo = ref(null)

const data = ref([])
const filteredData = ref([])
const sortedData = ref([])
const sortField = ref()
const sortOrder = ref()
const search = ref('')
const filterClub = ref()
const filterPosition = ref()
const filterNationality = ref()
const positionOptions = ref([])
const nationalityOptions = ref([])
const modalOpen = ref(false)
const activeTab = ref('add')
const isEdit = ref(false)

const importLoading = ref(false)
const importForm = reactive({ provider: undefined, mode: 'club', league_id: undefined, club_id: undefined, update_only: true, season_year: undefined, force_overwrite: false })

const leagueOptions = ref([])
const clubOptions = ref([])

const form = reactive({
  player_id: null,
  player_name: '',
  player_nationality: '',
  player_infor: '',
  position: '',
  player_date_of_birth: null,
  player_img: null
})

const columns = [
  { title: 'Image', dataIndex: 'avatar', key: 'avatar', width: 90, align: 'center' },
  { title: 'Player name', dataIndex: 'name', key: 'name', sorter: true, width: 220 },
  { title: 'Club', dataIndex: 'club', key: 'club', sorter: true, width: 180 },
  { title: 'Position', dataIndex: 'position', key: 'position', sorter: true, width: 140 },
  { title: 'Nationality', dataIndex: 'country', key: 'country', sorter: true, width: 140 },
  { title: 'Actions', key: 'actions', width: 160, align: 'center' }
]

const fetchPlayers = async () => {
  let res

  // Nếu đang ở /admin/clubs/:id/players → chỉ fetch player của club đó
  if (clubId) {
    res = await playersService.getPlayersByClubId(clubId)

    // Đồng thời lấy info CLB
    const club = await clubsService.getClubById(clubId)
    clubName.value = club?.data?.club_name || null
    clubLogo.value = club?.data?.club_img || null

  } else {
    res = await playersService.getAllPlayers()
  }

  const items = Array.isArray(res.data) ? res.data : []

  data.value = items.map((p) => ({
    ...p,
    avatar: p.player_img || p.player_avatar || '',
    name: p.player_name,
    country: p.player_nationality || '',
    club: p.club?.club_name || p.club_name || '',
    position: p.position || ''
  }))
  // build filter options
  const positions = Array.from(new Set(data.value.map(i => i.position).filter(Boolean)))
  positionOptions.value = positions.map(v => ({ label: v, value: v }))
  const nationalities = Array.from(new Set(data.value.map(i => i.country).filter(Boolean)))
  nationalityOptions.value = nationalities.map(v => ({ label: v, value: v }))
  filterData()
}

const openEdit = (record) => {
  isEdit.value = true
  Object.assign(form, {
    player_id: record.player_id,
    player_name: record.player_name,
    player_nationality: record.player_nationality,
    player_infor: record.player_infor,
    player_date_of_birth: record.player_date_of_birth ? dayjs(record.player_date_of_birth) : null,
    position: record.position,
    player_img: null
  })
  activeTab.value = 'add'
  modalOpen.value = true
}

const handleImageChange = (e) => {
  const file = e.target.files?.[0]
  if (file) form.player_img = file
}

const savePlayer = async () => {
  try {
    await playersService.updatePlayer(form.player_id, form)
    message.success('Player updated')
    modalOpen.value = false
    fetchPlayers()
  } catch {
    message.error('Failed to update player')
  }
}

const handleDelete = async (record) => {
  Modal.confirm({
    title: `Delete player "${record.name}"?`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    async onOk() {
      try {
        await playersService.deletePlayer(record.player_id)
        message.success('Player deleted')
        fetchPlayers()
      } catch {
        message.error('Delete failed')
      }
    },
  })
}

const goDetail = (record) => {
  router.push(`/admin/players/${record.player_id}`)
}

onMounted(async () => {
  await fetchPlayers()
  try {
    const [clubsRes, leaguesRes] = await Promise.all([
      clubsService.getAllClubs(),
      leaguesService.getAllLeagues(),
    ])
    clubOptions.value = (clubsRes?.data || []).map(c => ({ label: c.club_name, value: c.club_id }))
    leagueOptions.value = (leaguesRes?.data || []).map(l => ({ label: l.league_name, value: l.league_id }))
  } catch (e) {
    clubOptions.value = []
    leagueOptions.value = []
  }
})

function handleTableChange(pag, filters, sorter) {
  sortField.value = sorter?.field
  sortOrder.value = sorter?.order
  applySort()
}

function filterData() {
  const term = (search.value || '').toLowerCase()
  filteredData.value = (data.value || []).filter(i => {
    const okName = !term || (i.name || '').toLowerCase().includes(term)
    const okClub = !filterClub.value || i.club === (clubOptions.value.find(c=>c.value===filterClub.value)?.label || '')
    const okPos = !filterPosition.value || i.position === filterPosition.value
    const okNation = !filterNationality.value || i.country === filterNationality.value
    return okName && okClub && okPos && okNation
  })
  applySort()
}

function applySort() {
  const list = filteredData.value ? [...filteredData.value] : []
  if (sortField.value && sortOrder.value) {
    const dir = sortOrder.value === 'ascend' ? 1 : -1
    list.sort((a, b) => {
      const f = sortField.value
      if (f === 'name') return (a.name || '').localeCompare(b.name || '') * dir
      if (f === 'club') return (a.club || '').localeCompare(b.club || '') * dir
      if (f === 'position') return (a.position || '').localeCompare(b.position || '') * dir
      if (f === 'country') return (a.country || '').localeCompare(b.country || '') * dir
      return 0
    })
  }
  sortedData.value = list
}

const openAddImport = () => {
  isEdit.value = false
  Object.assign(form, {
    player_id: null,
    player_name: '',
    player_nationality: '',
    player_infor: '',
    player_date_of_birth: null,
    position: '',
    player_img: null
  })
  activeTab.value = 'add'
  modalOpen.value = true
}

const resetModal = () => { modalOpen.value = false }

const doImport = async () => {
  try {
    importLoading.value = true
    if (!importForm.provider) {
      message.warning('Vui lòng chọn provider')
      return
    }
    if (importForm.mode === 'club' && !importForm.club_id) {
      message.warning('Vui lòng chọn CLB')
      return
    }
    if (importForm.mode === 'league' && !importForm.league_id) {
      message.warning('Vui lòng chọn Giải đấu')
      return
    }
    const payload = {
      provider: importForm.provider,
      club_id: importForm.mode === 'club' ? importForm.club_id : undefined,
      league_id: importForm.mode === 'league' ? importForm.league_id : undefined,
      update_only: importForm.update_only !== false,
      season_year: importForm.season_year || undefined,
      force_overwrite: importForm.force_overwrite || false,
    }
    const res = await playersService.importPlayers(payload)
    message.success(`Import xong: cập nhật ${res?.updated ?? 0}`)
    modalOpen.value = false
    await fetchPlayers()
  } catch (e) {
    console.error('Import players failed', e)
    message.error('Import players failed')
  } finally { importLoading.value = false }
}
</script>
