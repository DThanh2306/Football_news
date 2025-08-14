<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Users</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Quản lý người dùng</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600">Thêm người dùng</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      row-key="id"
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
          <a-button type="link" size="small" @click="viewUser(record)">Xem chi tiết</a-button>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="showModal"
      title="Chi tiết người dùng"
      :footer="null"
      width="900"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="flex flex-col items-center border-r md:col-span-1">
          <img :src="selectedUser.avatar || defaultAvatar" class="w-24 h-24 rounded-full border mb-3" />
          <h2 class="text-lg font-bold">{{ selectedUser.username }}</h2>
          <p class="text-sm text-gray-500 break-all">{{ selectedUser.email }}</p>
          <a-tag color="blue" class="mt-2">{{ selectedUser.role }}</a-tag>
          <div class="mt-4 text-sm text-gray-600 space-y-1">
            <div><strong>Số bài viết:</strong> {{ selectedUser.postsCount ?? 0 }}</div>
            <div><strong>Số bình luận:</strong> {{ selectedUser.commentsCount ?? 0 }}</div>
            <div><strong>Điện thoại:</strong> {{ selectedUser.phone || '—' }}</div>
            <div><strong>Địa chỉ:</strong> {{ selectedUser.address || '—' }}</div>
            <div><strong>Ngày tạo:</strong> {{ formatDate(selectedUser.created_at ) }}</div>
          </div>
        </div>

        <div class="md:col-span-2">
          <a-tabs v-model:activeKey="detailTab">
            <a-tab-pane key="posts" tab="Bài viết">
              <a-spin :spinning="loadingDetail.posts">
                <ul class="space-y-3">
                  <li v-for="p in detailPosts" :key="p.post_id">
                    <router-link :to="'/post/' + p.post_slug" class="text-blue-700 hover:underline font-medium">
                      {{ p.post_title }}
                    </router-link>
                    <div class="text-xs text-gray-400">{{ formatDate(p.post_create_at) }}</div>
                  </li>
                  <li v-if="!detailPosts.length" class="text-gray-400">Không có bài viết nào.</li>
                </ul>
              </a-spin>
            </a-tab-pane>

            <a-tab-pane key="comments" tab="Bình luận">
              <a-spin :spinning="loadingDetail.comments">
                <ul class="space-y-3">
                  <li v-for="c in detailComments" :key="c.cmt_id">
                    <div class="text-gray-800">{{ c.cmt_content }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      Bài viết:
                      <router-link :to="'/post/' + c.post_slug" class="text-blue-600 hover:underline">
                        {{ c.post_title || ('#' + c.post_id) }}
                      </router-link>
                      &nbsp;|&nbsp;{{ formatDate(c.cmt_create_at) }}
                    </div>
                  </li>
                  <li v-if="!detailComments.length" class="text-gray-400">Không có bình luận nào.</li>
                </ul>
              </a-spin>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { usersService } from '@/services/users.service'
import { postsService } from '@/services/posts.service'
import { commentsService } from '@/services/comments.service'

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const columns = [
  { title: 'Ảnh đại diện', dataIndex: 'avatar', key: 'avatar' },
  { title: 'Tên người dùng', dataIndex: 'username', key: 'username' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Số bài viết', dataIndex: 'postsCount', key: 'postsCount' },
  { title: 'Số bình luận', dataIndex: 'commentsCount', key: 'commentsCount' },
  { title: 'Thao tác', key: 'actions' }
]

const data = ref([])
const loading = ref(false)

const showModal = ref(false)
const selectedUser = ref({})
const detailTab = ref('posts')

const detailPosts = ref([])
const detailComments = ref([])
const loadingDetail = reactive({ posts: false, comments: false })

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await usersService.getAll()
    data.value = res.data
  } catch {
    message.error('Không thể tải danh sách người dùng!')
    data.value = []
  } finally {
    loading.value = false
  }
}

const viewUser = (record) => {
  selectedUser.value = { ...record }
  detailTab.value = 'posts'
  showModal.value = true
  loadUserPosts()
}

const loadUserPosts = async () => {
  loadingDetail.posts = true
  try {
    const res = await postsService.getAllPosts( { user_id: selectedUser.value.id })
    console.log('User Posts:', selectedUser.value.id )
    detailPosts.value = res?.data?.items
    console.log('Posts:', detailPosts.value)
  } catch {
    detailPosts.value = []
  } finally {
    loadingDetail.posts = false
  }
}

const loadUserComments = async () => {
  loadingDetail.comments = true
  try {
    const { data } = await commentsService.getCommentByUserId(selectedUser.value.id )
    detailComments.value = data || []
    console.log('Comments:', detailComments.value)
  } catch {
    detailComments.value = []
  } finally {
    loadingDetail.comments = false
  }
}

watch(detailTab, (tab) => {
  if (!selectedUser.value.id) return
  if (tab === 'posts') loadUserPosts()
  if (tab === 'comments') loadUserComments()
})

function formatDate(d) {
  if (!d) return '—'
  const t = new Date(d)
  return isNaN(t.getTime()) ? d : t.toLocaleDateString()
}

onMounted(fetchUsers)
</script>
