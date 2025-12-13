<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Leagues</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Manage Leagues</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openCreate">
        Add league
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ pageSize: 10, showTotal: (t) => `Total ${t}` }"
      :row-key="rowKeyFn"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- Logo -->
        <template v-if="column.dataIndex === 'league_img'">
          <div class="flex items-center gap-3">
            <img
              v-if="record.league_img"
              :src="record.league_img"
              alt="logo"
              class="w-9 h-9 object-contain rounded"
            />
            <span class="text-gray-500" v-else>—</span>
          </div>
        </template>

        <!-- Actions -->
        <template v-else-if="column.dataIndex === 'league_manager'">
          <div class="flex items-center gap-2">
            <span v-if="lmMap[record.league_id]">{{ lmMap[record.league_id].username }}</span>
            <span v-else class="text-gray-400">Unassigned</span>
            <a-button type="link" size="small" @click="openAssignLM(record)">Change</a-button>
          </div>
        </template>

        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">Edit</a-button>
          <a-popconfirm
            title="Confirm to delete this league?"
            ok-text="Delete"
            cancel-text="Cancel"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">Delete</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- Modal create / edit -->
    <a-modal
      :title="isEdit ? 'Edit league' : 'Add league'"
      v-model:open="modalOpen"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="handleCancel"
      destroyOnClose
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="League name" name="league_name">
          <a-input v-model:value="form.league_name" placeholder="e.g. Premier League" allow-clear />
        </a-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Logo (upload)" name="league_img">
            <a-upload
              :before-upload="beforeUpload"
              :show-upload-list="false"
              accept="image/*"
              list-type="picture-card"
            >
              <div v-if="form.league_img" class="w-24 h-24 border rounded flex items-center justify-center overflow-hidden">
                <img :src="form.league_img" alt="preview" class="object-contain w-full h-full" />
              </div>
              <div v-else class="w-24 h-24 border rounded flex items-center justify-center">
                <span class="text-xs">Upload</span>
              </div>
            </a-upload>
            <div class="text-xs text-gray-500 mt-1">The image will be converted to base64 and sent to the server via field <code>league_img</code>.</div>
          </a-form-item>

          <a-form-item label="Or paste logo URL" name="league_img_url">
            <a-input
              v-model:value="imgUrlInput"
              placeholder="https://..."
              allow-clear
              @change="syncUrlToForm"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <!-- Modal gán League Manager -->
    <a-modal v-model:open="assignModalOpen" title="Assign League Manager" @ok="doAssignLM" @cancel="() => assignModalOpen = false">
      <div class="space-y-3">
        <div>
          <div class="text-xs text-gray-500 mb-1">Select manager</div>
          <a-select v-model:value="assignUserId" style="width: 100%" :options="lmUsers.map(u => ({ label: u.username, value: u.user_id }))" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { leaguesService } from '@/services/leagues.service'
import { leagueManagersService } from '@/services/leagueManagers.service'
import { usersService } from '@/services/users.service'

// ====== Table columns ======
const columns = [
  { title: 'Logo', dataIndex: 'league_img', key: 'league_img', width: 120 },
  { title: 'League Name', dataIndex: 'league_name', key: 'league_name' },
  { title: 'League Manager', dataIndex: 'league_manager', key: 'league_manager', width: 220 },
  { title: 'Action', key: 'actions', width: 140 }
]

// ====== State ======
const data = ref([])
const loading = ref(false)

// League Manager data
const lmList = ref([])
const lmMap = ref({}) // league_id -> { id, user_id, username }
const lmUsers = ref([]) // list users with role league_manager

const assignModalOpen = ref(false)
const assignLeagueId = ref(null)
const assignUserId = ref(null)

const modalOpen = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref(null)

const formRef = ref()
const form = ref({
  league_name: '',
  league_img: '' // base64 hoặc URL
})
const imgUrlInput = ref('')

// ====== Validation ======
const rules = {
  league_name: [{ required: true, message: 'Enter the League name' }],
}

// ====== Helpers ======
const rowKeyFn = (record) => record?.league_id || record?._id || record?.id

const resetForm = () => {
  form.value = { league_name: '', league_img: '' }
  imgUrlInput.value = ''
  editingId.value = null
  isEdit.value = false
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
  })

const beforeUpload = async (file) => {
  try {
    const base64 = await fileToBase64(file)
    form.value.league_img = base64
    imgUrlInput.value = ''
    return false
  } catch {
    message.error('Không đọc được file ảnh')
    return false
  }
}

const syncUrlToForm = () => {
  // if there is a URL, prefer URL; if URL cleared keep existing base64
  if (imgUrlInput.value) form.value.league_img = imgUrlInput.value.trim()
}

// ====== CRUD ======
const fetchLeagues = async () => {
  loading.value = true
  try {
    const res = await leaguesService.getAllLeagues()
    data.value = res?.data || res || []

    // load league managers
    const lmRes = await leagueManagersService.list()
    lmList.value = lmRes?.data || lmRes || []
    lmMap.value = Object.fromEntries(lmList.value.map(r => [r.league_id, { id: r.id, user_id: r.user_id, username: r.username }]))

    // load users with role league_manager (filter client-side)
    try {
      const usersRes = await usersService.getAll()
      const list = usersRes?.data || usersRes || []
      // normalize id field and filter by role
      lmUsers.value = list
        .map(u => ({
          ...u,
          user_id: u.user_id ?? u.id,
        }))
        .filter(u => u.role === 'league_manager' && u.user_id)
    } catch (e) {
      console.error('Failed to load users for LM assign:', e?.response?.data || e?.message)
      lmUsers.value = []
    }
  } catch {
    data.value = []
    message.error('Failed to load leagues')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const openEdit = (record) => {
  resetForm()
  isEdit.value = true
  editingId.value = record?.league_id || record?._id || record?.id
  form.value.league_name = record.league_name || ''
  form.value.league_img = record.league_img || ''
  imgUrlInput.value = record.league_img || ''
  modalOpen.value = true
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    await formRef.value?.validate()

    if (isEdit.value && editingId.value) {
      await leaguesService.updateLeague(editingId.value, {
        league_name: form.value.league_name,
        league_img: form.value.league_img || ''
      })
      message.success('Cập nhật giải đấu thành công')
    } else {
      await leaguesService.createLeague({
        league_name: form.value.league_name,
        league_img: form.value.league_img || ''
      })
      message.success('Tạo giải đấu thành công')
    }

    modalOpen.value = false
    await fetchLeagues()
  } catch (e) {
    if (!e?.errorFields) {
      message.error('Something went wrong, please try again')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modalOpen.value = false
}

const handleDelete = async (record) => {
  const id = record?.league_id || record?._id || record?.id
  if (!id) {
    message.error('Cannot determine league ID')
    return
  }
  try {
    await leaguesService.deleteLeague(id)
    message.success('League deleted')
    await fetchLeagues()
  } catch {
    message.error('Delete failed')
  }
}

const openAssignLM = (record) => {
  assignLeagueId.value = record.league_id
  assignUserId.value = lmMap.value[record.league_id]?.user_id || null
  assignModalOpen.value = true
}

const doAssignLM = async () => {
  if (!assignLeagueId.value || !assignUserId.value) {
    message.warning('Please select all required information')
    return
  }
  try {
    // remove old if exists
    const current = lmMap.value[assignLeagueId.value]
    if (current?.id) {
      await leagueManagersService.remove(current.id)
    }
    await leagueManagersService.assign({ user_id: assignUserId.value, league_id: assignLeagueId.value })
    message.success('League Manager updated')
    assignModalOpen.value = false
    await fetchLeagues()
  } catch {
    message.error('Assign League Manager failed')
  }
}

onMounted(fetchLeagues)
</script>


<style scoped>
:deep(.ant-table-cell) img {
  image-rendering: -webkit-optimize-contrast;
}
</style>
