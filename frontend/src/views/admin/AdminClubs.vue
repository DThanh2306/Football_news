<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Clubs</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Quản lý đội bóng</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openCreate">Thêm đội bóng</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ pageSize: 5 }"
      row-key="club_id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'img'">
          <img
            v-if="record.club_img"
            :src="record.club_img"
            alt="logo"
            class="w-12 h-12 object-contain rounded shadow"
          />
        </template>
        <template v-if="column.key === 'player_actions'">
          <a-button type="link" size="small">Xem</a-button>
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">Sửa</a-button>
          <a-popconfirm
            title="Bạn chắc chắn muốn xóa đội bóng này?"
            ok-text="Xóa"
            cancel-text="Hủy"
            @confirm="handleDelete(record.club_id)"
          >
            <a-button type="link" danger size="small">Xóa</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- Modal Thêm/Sửa -->
    <a-modal
      v-model:open="modalOpen"
      :title="isEdit ? 'Sửa đội bóng' : 'Thêm đội bóng'"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="resetForm"
      destroyOnClose
    >
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item label="Tên đội bóng" name="club_name" :rules="[{ required: true, message: 'Vui lòng nhập tên đội' }]">
          <a-input v-model:value="form.club_name" />
        </a-form-item>
        <a-form-item label="Giải đấu" name="league" :rules="[{ required: true, message: 'Vui lòng nhập giải đấu' }]">
          <a-input v-model:value="form.league" />
        </a-form-item>
        <a-form-item label="Quốc gia" name="country" :rules="[{ required: true, message: 'Vui lòng nhập quốc gia' }]">
          <a-input v-model:value="form.country" />
        </a-form-item>
        <a-form-item label="Logo đội bóng">
          <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="form.club_img" class="mt-2">
            <img :src="form.club_img" alt="preview" class="w-16 h-16 object-contain rounded shadow" />
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

const columns = [
  { title: 'Ảnh', dataIndex: 'club_img', key: 'img' },
  { title: 'Tên đội', dataIndex: 'club_name', key: 'name' },
  { title: 'Giải đấu', dataIndex: 'league_name', key: 'league' },
  { title: 'Quốc gia', dataIndex: 'country', key: 'country' },
  { title: 'Cầu thủ', key: 'player_actions' },
  { title: 'Thao tác', key: 'actions' }
]

const data = ref([])
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

// Fetch clubs
const fetchClubs = async () => {
  loading.value = true
  try {
    const res = await clubsService.getAllClubs()
    data.value = res?.data || res || []
  } catch {
    data.value = []
  } finally {
    loading.value = false
  }
}

// Open create modal
const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', league: '', country: '', club_img: '' }
  modalOpen.value = true
}

// Open edit modal
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

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Handle file input
const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.club_img = await fileToBase64(file)
  }
}

// Submit create/edit
const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await clubsService.updateClub(editingId.value, form.value)
      message.success('Cập nhật thành công!')
    } else {
      await clubsService.createClub(form.value)
      message.success('Thêm mới thành công!')
    }
    modalOpen.value = false
    fetchClubs()
  } catch {
    message.error('Có lỗi xảy ra!')
  } finally {
    submitting.value = false
  }
}

// Delete club
const handleDelete = (id) => async () => {
  loading.value = true
  try {
    await clubsService.deleteClub(id)
    message.success('Đã xóa đội bóng!')
    fetchClubs()
  } catch {
    message.error('Xóa thất bại!')
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  modalOpen.value = false
  isEdit.value = false
  editingId.value = null
  form.value = { club_name: '', league: '', country: '', club_img: '' }
}

onMounted(fetchClubs)
</script>