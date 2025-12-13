<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Clubs</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Manage Clubs</h1>

      <div class="flex items-center gap-3">
        <!-- Tìm kiếm -->
        <a-input
          v-model:value="search"
          placeholder="Search clubs..."
          allow-clear
          class="w-56"
          @input="filterData"
        />

        <a-button
          type="primary"
          class="bg-blue-600 border-blue-600"
          @click="openCreate"
        >
          Thêm đội bóng
        </a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      :loading="loading"
      :pagination="{ pageSize: 6 }"
      row-key="club_id"
      bordered
      class="rounded-xl shadow-sm"
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
        <template v-if="column.key === 'league'">
          <span class="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
            {{ record.league_name }}
          </span>
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

    <!-- Modal -->
    <a-modal
      v-model:open="modalOpen"
      :title="isEdit ? 'Edit club' : 'Add club'"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="resetForm"
      destroyOnClose
    >
      <a-form ref="formRef" :model="form" layout="vertical">

        <a-form-item label="Club name" name="club_name" :rules="[{ required: true, message: 'Please enter club name' }]">
          <a-input v-model:value="form.club_name" />
        </a-form-item>

        <a-form-item label="League" name="league" :rules="[{ required: true, message: 'Please enter league' }]">
          <a-input v-model:value="form.league" />
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

      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { clubsService } from '@/services/clubs.service'
import { useRouter } from 'vue-router'

const search = ref("")
const data = ref([])
const filteredData = ref([])
const router = useRouter()


const filterData = () => {
  const term = search.value.toLowerCase()
  filteredData.value = data.value.filter(c =>
    c.club_name?.toLowerCase().includes(term)
  )
}

const columns = [
  { title: 'Logo', dataIndex: 'club_img', key: 'img', width: 90, align: 'center' },
  { title: 'Tên đội', dataIndex: 'club_name', key: 'name' },
  { title: 'Giải đấu', dataIndex: 'league_name', key: 'league', width: 140 },
  { title: 'Quốc gia', dataIndex: 'country', key: 'country', width: 120 },
  { title: 'Cầu thủ', key: 'player_actions', align: 'center', width: 100 },
  { title: 'Thao tác', key: 'actions', align: 'center', width: 120 }
]

const loading = ref(false)
const modalOpen = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = ref({
  club_name: '',
  league: '',
  country: '',
  club_img: ''
})

const fetchClubs = async () => {
  loading.value = true
  try {
    const res = await clubsService.getAllClubs()
    data.value = res?.data || res || []
    filteredData.value = data.value
  } catch {
    data.value = []
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', league: '', country: '', club_img: '' }
  modalOpen.value = true
}

const openEdit = (record) => {
  isEdit.value = true
  editingId.value = record.club_id
  form.value = {
    club_name: record.club_name,
    league: record.league,
    country: record.country,
    club_img: record.club_img
  }
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
    if (isEdit.value) {
      await clubsService.updateClub(editingId.value, form.value)
      message.success('Cập nhật thành công!')
    } else {
      await clubsService.createClub(form.value)
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
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', league: '', country: '', club_img: '' }
}

onMounted(fetchClubs)
</script>
