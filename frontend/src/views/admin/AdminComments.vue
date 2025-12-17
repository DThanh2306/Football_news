<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Comments</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Comment Management</h1>
      <div class="flex items-center gap-2">
        <a-input
          v-model:value="keyword"
          placeholder="Search comments, users, posts"
          class="w-72"
          allow-clear
        >
          <template #prefix>
            <i class="ri-search-line text-gray-500"></i>
          </template>
        </a-input>
      </div>
    </div>
    <div class="overflow-auto border rounded-lg shadow-sm bg-white overflow-y-auto" style="max-height: calc(100vh - 180px)">
      <a-table
      :columns="computedColumns"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      row-key="cmt_id"
      bordered
      size="middle"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'cmt_content'">
          <span class="text-gray-700">Nội dung</span>
        </template>
      </template>
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
          <router-link :to="`/post/${record.post_id}`" class="text-blue-700 hover:underline line-clamp-2">
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
   </div>

    <!-- Comment detail modal -->
    <a-modal
      v-model:open="detailModalOpen"
      title="Comment details"
      width=""
      :bodyStyle="{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: '0' }"
      :style="{ top: '20px' }"
      :footer="null"
      destroyOnClose
    >
      <div v-if="selectedComment" class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <!-- Left: Full Post -->
        <div class="max-h-[80vh] col-span-4 overflow-auto pr-2 border-r">
          <div class="mb-2 font-semibold text-blue-700">Bài viết</div>
          <div v-if="postDetail">
            <h3 class="text-lg font-bold mb-2">{{ postDetail.post_title }}</h3>
            <div class="prose prose-sm max-w-none" v-html="postDetail.post_content"></div>
          </div>
          <div v-else class="text-gray-500 text-sm">Đang tải bài viết...</div>
        </div>
        <!-- Right: Comment Detail + Actions -->
        <div class="max-h-[80vh] col-span-2 overflow-auto pl-2">
          <div class="mb-4 flex items-center gap-3">
            <img :src="selectedComment.user_avatar || defaultAvatar" class="w-10 h-10 rounded-full border" />
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
            <router-link :to="`/post/${selectedComment.post_id}`" class="text-blue-700 hover:underline">
              {{ selectedComment.post_title }}
            </router-link>
          </div>
          <div class="mb-4">
            <span class="font-semibold text-blue-700">Comment content:</span>
            <div class="bg-blue-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-wrap break-words">
              {{ selectedComment.cmt_content }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a-popconfirm title="Xóa bình luận này?" ok-text="Xóa" cancel-text="Hủy" @confirm="handleDelete(selectedComment.cmt_id)">
              <a-button danger type="default">Delete Comment</a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { commentsService } from '@/services/comments.service'
import { postsService } from '@/services/posts.service'
import dayjs from 'dayjs'

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const sortField = ref('cmt_create_at')
const sortOrder = ref('descend') // 'ascend' | 'descend' | null

const computedColumns = computed(() => [
  { title: 'Người bình luận', key: 'user' },
  { title: 'Bài viết', key: 'post' },
  { title: 'Nội dung', dataIndex: 'cmt_content', key: 'cmt_content', ellipsis: true, width: 420 },
  {
    title: 'Ngày',
    dataIndex: 'cmt_create_at',
    key: 'cmt_create_at',
    sorter: true,
    sortOrder: sortField.value === 'cmt_create_at' ? sortOrder.value : null,
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  { title: 'Thao tác', key: 'actions' },
])

const pagination = ref({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50'] })
const keyword = ref('')

const queryKey = computed(() => ['comments', pagination.value.current, pagination.value.pageSize, keyword.value, sortField.value, sortOrder.value])

const query = useQuery({
  queryKey,
  queryFn: async () => {
    const res = await commentsService.getAllComments({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      q: keyword.value,
      sort: 'cmt_create_at',
      order: sortOrder.value === 'ascend' ? 'asc' : 'desc',
    })
    return res.data
  },
  keepPreviousData: true,
})

const data = computed(() => query.data.value?.items ?? [])
const loading = computed(() => query.isLoading.value || query.isFetching.value)

watchEffect(() => {
  if (query.data.value?.pagination?.total != null) {
    pagination.value.total = query.data.value.pagination.total
  }
})

const detailModalOpen = ref(false)
const selectedComment = ref(null)
const postDetail = ref(null)

function handleTableChange(pag, filters, sorter) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  if (sorter?.field === 'cmt_create_at') {
    sortField.value = 'cmt_create_at'
    sortOrder.value = sorter.order || null
  } else if (!sorter?.order) {
    sortField.value = 'cmt_create_at'
    sortOrder.value = 'descend'
  }
}

async function openDetail(record) {
  selectedComment.value = { ...record }
  postDetail.value = null
  detailModalOpen.value = true
  try {
    const resp = await postsService.getPostById(record.post_id)
    postDetail.value = resp.data
  } catch (e) {
    console.error('Failed to load post:', e)
  }
}

async function handleDelete(id) {
  try {
    await commentsService.deleteComment(id);
    // refetch query to keep pagination accurate
    await query.refetch()
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
}

</script>
