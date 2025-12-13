<template>
  <div class="p-6">

    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Cầu thủ</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Header khi đang xem cầu thủ theo CLB -->
    <div v-if="clubName" class="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-4">
      <img v-if="clubLogo" :src="clubLogo" class="w-14 h-14 object-contain rounded shadow" />
      <div>
        <h2 class="text-xl font-bold text-blue-700">{{ clubName }}</h2>
        <p class="text-gray-600 text-sm">Tổng: {{ data.length }} cầu thủ</p>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-6">
      <i class="ri-user-star-line text-2xl text-blue-600"></i>
      <h1 class="text-2xl font-bold text-blue-700">Quản lý cầu thủ</h1>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="{ pageSize: 6 }"
      row-key="player_id"
      bordered
      class="rounded-xl shadow-sm"
    >
      <template #bodyCell="{ column, record }">

        <!-- Avatar -->
        <template v-if="column.key === 'avatar'">
          <img
            v-if="record.avatar"
            :src="record.avatar"
            alt="avatar"
            class="w-10 h-10 object-cover rounded-full border shadow"
          />
        </template>

        <!-- Club badge -->
        <template v-if="column.key === 'club'">
          <span class="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
            {{ record.club }}
          </span>
        </template>

        <!-- Actions -->
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="goDetail(record)">Chi tiết</a-button>
          <a-button type="link" size="small" @click="openEdit(record)">Sửa</a-button>

          <a-popconfirm
            title="Are you sure you want to delete this player?"
            ok-text="Delete"
            cancel-text="Hủy"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">Delete</a-button>
          </a-popconfirm>
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
        <a-form-item label="Player name">
          <a-input v-model:value="form.player_name" />
        </a-form-item>

        <a-form-item label="Quốc tịch">
          <a-input v-model:value="form.player_nationality" />
        </a-form-item>

        <a-form-item label="Ngày sinh">
          <a-date-picker v-model:value="form.player_date_of_birth" style="width: 100%" />
        </a-form-item>

        <a-form-item label="Vị trí">
          <a-input v-model:value="form.position" />
        </a-form-item>

        <a-form-item label="Thông tin thêm">
          <a-textarea v-model:value="form.player_infor" rows="3" />
        </a-form-item>

        <a-form-item label="Avatar">
          <input type="file" accept="image/*" @change="handleImageChange" />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { playersService } from '@/services/players.service'
import { clubsService } from '@/services/clubs.service'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const clubId = route.params.id || null
const clubName = ref(null)
const clubLogo = ref(null)

const data = ref([])
const showModal = ref(false)

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
  { title: 'Ảnh', dataIndex: 'avatar', key: 'avatar', width: 70 },
  { title: 'Tên cầu thủ', dataIndex: 'name', key: 'name' },
  { title: 'Đội bóng', dataIndex: 'club', key: 'club', width: 150 },
  { title: 'Vị trí', dataIndex: 'position', key: 'position', width: 120 },
  { title: 'Quốc tịch', dataIndex: 'country', key: 'country', width: 120 },
  { title: 'Thao tác', key: 'actions', width: 160 }
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
    avatar: p.player_img,
    name: p.player_name,
    country: p.player_nationality,
    club: p.club_name || '—',
    position: p.position || '—'
  }))
}

const openEdit = (record) => {
  Object.assign(form, {
    player_id: record.player_id,
    player_name: record.player_name,
    player_nationality: record.player_nationality,
    player_infor: record.player_infor,
    player_date_of_birth: record.player_date_of_birth ? dayjs(record.player_date_of_birth) : null,
    position: record.position,
    player_img: null
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
    message.success('Player updated')
    showModal.value = false
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

onMounted(fetchPlayers)
</script>
