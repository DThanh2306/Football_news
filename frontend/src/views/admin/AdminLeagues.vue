<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Leagues</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Quản lý giải đấu</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openCreate">
        Thêm giải đấu
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
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">Sửa</a-button>
          <a-popconfirm
            title="Xác nhận xóa giải đấu này?"
            ok-text="Xóa"
            cancel-text="Hủy"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">Xóa</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- Modal create / edit -->
    <a-modal
      :title="isEdit ? 'Sửa giải đấu' : 'Thêm giải đấu'"
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
        <a-form-item label="Tên giải đấu" name="league_name">
          <a-input v-model:value="form.league_name" placeholder="Ví dụ: Premier League" allow-clear />
        </a-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Logo (Upload)" name="league_img">
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
            <div class="text-xs text-gray-500 mt-1">Ảnh sẽ được chuyển thành base64 và gửi lên server qua trường <code>league_img</code>.</div>
          </a-form-item>

          <a-form-item label="Hoặc dán URL logo" name="league_img_url">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { leaguesService } from '@/services/leagues.service'

// ====== Table columns ======
const columns = [
  { title: 'Logo', dataIndex: 'league_img', key: 'league_img', width: 120 },
  { title: 'Tên giải đấu', dataIndex: 'league_name', key: 'league_name' },
  { title: 'Thao tác', key: 'actions', width: 140 }
]

// ====== State ======
const data = ref([])
const loading = ref(false)

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
  league_name: [{ required: true, message: 'Vui lòng nhập tên giải đấu' }],
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
  // nếu có URL, ưu tiên URL; nếu xoá URL thì giữ nguyên base64
  if (imgUrlInput.value) form.value.league_img = imgUrlInput.value.trim()
}

// ====== CRUD ======
const fetchLeagues = async () => {
  loading.value = true
  try {
    const res = await leaguesService.getAllLeagues()
    data.value = res?.data || res || []
  } catch {
    data.value = []
    message.error('Không tải được danh sách giải đấu')
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
      message.error('Có lỗi xảy ra, vui lòng thử lại')
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
    message.error('Không xác định được ID giải đấu')
    return
  }
  try {
    await leaguesService.deleteLeague(id)
    message.success('Đã xóa giải đấu')
    await fetchLeagues()
  } catch {
    message.error('Xóa thất bại')
  }
}

onMounted(fetchLeagues)
</script>

<style scoped>
:deep(.ant-table-cell) img {
  image-rendering: -webkit-optimize-contrast;
}
</style>
