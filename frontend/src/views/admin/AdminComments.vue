<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Comments</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex items-center gap-3 mb-6">
      <i class="ri-chat-3-line text-2xl text-blue-600"></i>
      <h1 class="text-2xl font-bold text-blue-700">Manage Comments</h1>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="{ pageSize: 10 }"
      row-key="cmt_id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'user'">
          <div class="flex items-center gap-2">
            <img
              :src="record.user_avatar || defaultAvatar"
              alt="avatar"
              class="w-8 h-8 object-cover rounded-full border"
            />
            <span>{{ record.username }}</span>
          </div>
        </template>
        <template v-if="column.key === 'post'">
          <router-link :to="`/post/${record.post_id}`" class="text-blue-700 hover:underline">
            {{ record.post_title }}
          </router-link>
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openDetail(record)">Chi tiết</a-button>
          <a-popconfirm
            title="Are you sure you want to delete this comment?"
            ok-text="Delete"
            cancel-text="Cancel"
            @confirm="handleDelete(record.cmt_id)"
          >
            <a-button type="link" danger size="small">Delete</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- Comment detail modal -->
    <a-modal
      v-model:open="detailModalOpen"
      title="Comment details"
      width="500px"
      :footer="null"
      destroyOnClose
    >
      <div v-if="selectedComment">
        <div class="mb-4 flex items-center gap-3">
          <img
            :src="selectedComment.user_avatar || defaultAvatar"
            class="w-10 h-10 rounded-full border"
          />
          <div>
            <div class="font-semibold text-blue-700">{{ selectedComment.username }}</div>
            <div class="text-xs text-gray-500">{{ selectedComment.user_email }}</div>
          </div>
        </div>
        <div class="mb-2 text-gray-500 text-sm">
          <span>Commented at: </span>
          <span class="font-semibold">{{ selectedComment.cmt_create_at }}</span>
        </div>
        <div class="mb-2">
          <span class="font-semibold text-blue-700">Post: </span>
          <router-link
            :to="`/post/${selectedComment.post_id}`"
            class="text-blue-700 hover:underline"
          >
            {{ selectedComment.post_title }}
          </router-link>
        </div>
        <div class="mb-4">
          <span class="font-semibold text-blue-700">Comment content:</span>
          <div class="bg-blue-50 rounded p-3 mt-1 text-gray-800">
            {{ selectedComment.cmt_content }}
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { commentsService } from '@/services/comments.service'
import dayjs from 'dayjs'

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const columns = [
  { title: 'Người bình luận', key: 'user' },
  { title: 'Bài viết', key: 'post' },
  { title: 'Nội dung', dataIndex: 'cmt_content', key: 'cmt_content', ellipsis: true },
  {
    title: 'Ngày',
    dataIndex: 'cmt_create_at',
    key: 'cmt_create_at',
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  { title: 'Thao tác', key: 'actions' },
]

const data = ref([])

onMounted(async () => {
  const res = await commentsService.getAllComments()
  data.value = res.data
})

const detailModalOpen = ref(false)
const selectedComment = ref(null)

function openDetail(record) {
  selectedComment.value = { ...record }
  detailModalOpen.value = true
}

async function handleDelete(id) {
  try {
    await commentsService.deleteComment(id);
    data.value = data.value.filter((c) => c.cmt_id !== id);
   
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
}
</script>
