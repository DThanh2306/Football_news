<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Players</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex items-center gap-3 mb-6">
      <i class="ri-user-star-line text-2xl text-blue-600"></i>
      <h1 class="text-2xl font-bold text-blue-700">Quản lý cầu thủ</h1>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="{ pageSize: 5 }"
      row-key="player_id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'avatar'">
          <img
            v-if="record.avatar"
            :src="record.avatar"
            alt="avatar"
            class="w-10 h-10 object-cover rounded-full border shadow"
          />
        </template>

        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openEdit(record)">Sửa</a-button>
          <a-button type="link" danger size="small" @click="handleDelete(record)">Xóa</a-button>
        </template>
      </template>
    </a-table>

    <!-- Modal cập nhật -->
    <a-modal
      v-model:open="showModal"
      title="Cập nhật cầu thủ"
      @ok="savePlayer"
      okText="Lưu"
      cancelText="Hủy"
    >
      <a-form layout="vertical">
        <a-form-item label="Tên cầu thủ">
          <a-input v-model:value="form.player_name" />
        </a-form-item>

        <a-form-item label="Quốc tịch">
          <a-input v-model:value="form.player_nationality" />
        </a-form-item>

        <a-form-item label="Ngày sinh">
          <a-date-picker v-model:value="form.player_date_of_birth" style="width: 100%" />
        </a-form-item>

        <a-form-item label="Thông tin thêm">
          <a-textarea v-model:value="form.player_infor" rows="3" />
        </a-form-item>

        <a-form-item label="Ảnh đại diện">
          <input type="file" accept="image/*" @change="handleImageChange" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { playersService } from '@/services/players.service'
import dayjs from 'dayjs'

const data = ref([])
const showModal = ref(false)
const form = reactive({
  player_id: null,
  player_name: '',
  player_nationality: '',
  player_infor: '',
  player_date_of_birth: null,
  player_img: null,
})

const columns = [
  { title: 'Ảnh', dataIndex: 'avatar', key: 'avatar' },
  { title: 'Tên cầu thủ', dataIndex: 'name', key: 'name' },
  { title: 'Đội bóng', dataIndex: 'club', key: 'club' },
  { title: 'Vị trí', dataIndex: 'position', key: 'position' },
  { title: 'Quốc tịch', dataIndex: 'country', key: 'country' },
  { title: 'Thao tác', key: 'actions' },
]

const fetchPlayers = async () => {
  try {
    const res = await playersService.getAllPlayers()
    const items = Array.isArray(res.data) ? res.data : []
    data.value = items.map((p) => ({
      ...p,
      avatar: p.player_img,
      name: p.player_name,
      country: p.player_nationality,
      club: p.club_name || '—',
      position: p.position || '—',
    }))
  } catch (err) {
    console.error('Lỗi khi tải danh sách cầu thủ:', err)
    message.error('Lỗi khi tải danh sách cầu thủ')
  }
}

const openEdit = (record) => {
  Object.assign(form, {
    player_id: record.player_id,
    player_name: record.player_name,
    player_nationality: record.player_nationality,
    player_infor: record.player_infor,
    player_date_of_birth: record.player_date_of_birth ? dayjs(record.player_date_of_birth) : null,
    player_img: null,
  })
  showModal.value = true
}

const handleImageChange = (e) => {
  const file = e.target.files?.[0]
  if (file) form.player_img = file
}

const savePlayer = async () => {
  try {
    await playersService.updatePlayer(form.player_id, form)
    message.success('Đã cập nhật cầu thủ')
    showModal.value = false
    fetchPlayers()
  } catch {
    message.error('Lỗi khi cập nhật cầu thủ')
  }
}

const handleDelete = async (record) => {
  Modal.confirm({
    title: `Xóa cầu thủ "${record.name}"?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    async onOk() {
      try {
        await playersService.deletePlayer(record.player_id)
        message.success('Đã xóa cầu thủ')
        fetchPlayers()
      } catch {
        message.error('Xóa thất bại')
      }
    },
  })
}

onMounted(fetchPlayers)
</script>
