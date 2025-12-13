<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Posts</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Post Management</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openCreate">
        Add new post
      </a-button>
    </div>
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center mb-4">
      <!-- Search -->
      <a-input
        v-model:value="filters.search"
        placeholder="Search title..."
        class="w-60"
        allow-clear
        @input="applyFilters"
      >
        <template #prefix>
          <i class="ri-search-line text-gray-500"></i>
        </template>
      </a-input>

      <!-- Status Filter -->
      <a-select
        v-model:value="filters.status"
        class="w-40"
        placeholder="Status"
        allow-clear
        @change="applyFilters"
      >
        <a-select-option value="pending">Pending</a-select-option>
        <a-select-option value="published">Published</a-select-option>
        <a-select-option value="draft">Draft</a-select-option>
        <a-select-option value="rejected">Rejected</a-select-option>
      </a-select>

      <!-- Date Range -->
      <a-range-picker v-model:value="filters.date" @change="applyFilters" class="w-72" />
    </div>
    <!-- Posts Table -->
    <div
      class="overflow-auto border rounded-lg shadow-sm bg-white overflow-y-auto"
      style="max-height: calc(100vh - 220px)"
    >
      <a-table
        :columns="columns"
        :data-source="posts"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="post_id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- Thumbnail -->
          <template v-if="column.key === 'thumbnail'">
            <img
              :src="record.post_images?.[0] || '/default-thumb.jpg'"
              class="w-14 h-14 object-cover rounded border shadow-sm"
            />thanh
          </template>
          <template v-if="column.key === 'username'">
            {{ record.username || 'Unknown' }}
          </template>

          <!-- Status -->
          <template v-if="column.key === 'post_status'">
            <a-tag :color="statusColorMap[record.post_status]" class="px-3 py-1 text-sm capitalize">
              {{ statusLabelMap[record.post_status] }}
            </a-tag>
          </template>

          <!-- Actions -->
          <template v-if="column.key === 'actions'">
            <div class="flex gap-2">
              <a-button size="small" type="link" @click="openDetail(record)">
                <i class="ri-edit-line text-base"></i> Detail
              </a-button>

              <a-popconfirm
                title="You want to delete this post?"
                ok-text="Delete"
                cancel-text="Cancel"
                @confirm="handleDelete(record.post_id)"
              >
                <a-button size="small" danger type="link">
                  <i class="ri-delete-bin-6-line text-base"></i> Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <!-- Modal -->
    <a-modal
      v-model:open="detailModalOpen"
      :title="selectedPost?.post_title || 'Post Details'"
      width="800px"
      :footer="null"
      destroyOnClose
    >
      <div v-if="selectedPost">
        <a-form layout="vertical" :model="selectedPost" name="updateForm" @finish="handleUpdate">
          <div class="grid grid-cols-2 gap-6">
            <!-- LEFT COLUMN -->
            <div>
              <a-form-item label="Title" required>
                <a-input v-model:value="selectedPost.post_title" size="large" />
              </a-form-item>

              <a-form-item label="Status">
                <a-select v-model:value="selectedPost.post_status" size="large">
                  <a-select-option value="published">published</a-select-option>
                  <a-select-option value="pending">pending</a-select-option>
                  <a-select-option value="draft">draft</a-select-option>
                  <a-select-option value="rejected">rejected</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item v-if="selectedPost.post_status === 'rejected'" label="Reject Reason">
                <a-input v-model:value="selectedPost.reject_reason" size="large" />
              </a-form-item>
            </div>

            <!-- RIGHT COLUMN (IMAGES) -->
            <div>
              <p class="font-semibold text-gray-700 mb-2">Images</p>
              <input type="file" accept="image/*" @change="onImageChange" />

              <div class="flex flex-wrap gap-3 mt-3">
                <div
                  v-for="(img, index) in selectedPost.post_images"
                  :key="index"
                  class="w-28 h-28 border rounded relative overflow-hidden shadow-sm"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                  <a-button
                    size="small"
                    danger
                    class="absolute top-1 right-1"
                    @click="removeImage(index)"
                  >
                    X
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- CONTENT EDITOR -->
          <a-form-item label="Content" class="mt-6">
            <quill-editor
              v-model:content="selectedPost.post_content"
              contentType="html"
              style="min-height: 240px"
            />
          </a-form-item>

          <!-- FOOTER BUTTONS -->
          <div class="flex justify-end gap-2 mt-4">
            <a-button
              @click="
                () => {
                  detailModalOpen.value = false
                  isCreating.value = false
                }
              "
            >
              Cancel
            </a-button>

            <a-button type="primary" html-type="submit"> Save </a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { postsService } from '@/services/posts.service'
import dayjs from 'dayjs'

const posts = ref([])
const loading = ref(false)
const detailModalOpen = ref(false)
const selectedPost = ref(null)
const isCreating = ref(false)

// Status maps
const statusLabelMap = {
  published: 'published',
  pending: 'pending',
  draft: 'draft',
  rejected: 'rejected',
}

const statusColorMap = {
  published: 'green',
  pending: 'blue',
  draft: 'orange',
  rejected: 'red',
}

const columns = [
  { title: 'Title', dataIndex: 'post_title', key: 'post_title' },
  {
    title: 'Author',
    dataIndex: 'username',
    key: 'username',
    customRender: ({ record }) => record.username || 'Unknown',
  },

  { title: 'Status', dataIndex: 'post_status', key: 'post_status' },
  {
    title: 'Posted At',
    dataIndex: 'post_create_at',
    key: 'post_create_at',
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  {
    title: 'Updated At',
    dataIndex: 'post_update_at',
    key: 'post_update_at',
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  { title: 'Actions', key: 'actions' },
]

// Fetch posts
const fetchPosts = async (params = {}) => {
  loading.value = true
  try {
    const res = await postsService.getAllPosts(params)
    posts.value = Array.isArray(res.data?.items) ? res.data.items : []
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedPost.value = {
    post_title: '',
    post_status: 'pending',
    post_content: '',
    post_images: [],
  }
  isCreating.value = true
  detailModalOpen.value = true
}

const openDetail = (record) => {
  selectedPost.value = {
    ...record,
    post_images: Array.isArray(record.post_images) ? [...record.post_images] : [],
  }
  isCreating.value = false
  detailModalOpen.value = true
}

const closeModal = () => {
  detailModalOpen.value = false
  isCreating.value = false
}

const onImageChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    selectedPost.value.post_images.push(reader.result)
  }
  reader.readAsDataURL(file)
}

const removeImage = (index) => {
  selectedPost.value.post_images.splice(index, 1)
}

// UPDATE + REVIEW handling
const handleUpdate = async () => {
  try {
    const p = selectedPost.value

    const payload = {
      post_id: p.post_id,
      post_title: p.post_title,
      post_content: p.post_content,
      post_slug: p.post_slug,
      post_images: p.post_images,
      tag_id: p.tag_id || [],
    }

    // CREATE
    if (isCreating.value) {
      const res = await postsService.createPost({
        post_title: p.post_title,
        post_content: p.post_content,
        images: p.post_images,
      })

      posts.value.unshift(res?.data || res)
      message.success('Post created successfully!')
      closeModal()
      return
    }

    // UPDATE CONTENT
    await postsService.updatePost(payload.post_id, payload)

    const newStatus = p.post_status

    // REVIEW LOGIC
    if (newStatus === 'published') {
      await postsService.reviewPost(p.post_id, { action: 'approve' })
    } else if (newStatus === 'draft') {
      await postsService.reviewPost(p.post_id, { action: 'draft' })
    } else if (newStatus === 'rejected') {
      if (!p.reject_reason) {
        message.warning('Reject reason is required')
        return
      }
      await postsService.reviewPost(p.post_id, {
        action: 'reject',
        reason: p.reject_reason,
      })
    }
    // NO REVIEW FOR pending → keep pending

    // APPLY UI UPDATE
    const idx = posts.value.findIndex((x) => x.post_id === payload.post_id)
    if (idx !== -1) {
      posts.value[idx] = {
        ...posts.value[idx],
        ...payload,
        post_status: newStatus,
        reject_reason: p.reject_reason || null,
      }
    }

    message.success('Update successful')
    closeModal()
  } catch (err) {
    console.error('Error:', err)
    message.error('Fail to update!')
  }
}

const handleDelete = async (post_id) => {
  try {
    await postsService.deletePost(post_id)
    posts.value = posts.value.filter((p) => p.post_id !== post_id)
    message.success('Post deleted successfully!')
  } catch {
    message.error('Post delete failed!')
  }
}
const filters = ref({
  search: '',
  status: null,
  date: null,
})

const applyFilters = () => {
  let params = {}

  if (filters.value.search) params.q = filters.value.search
  if (filters.value.status) params.post_status = filters.value.status

  if (filters.value.date) {
    params.start = filters.value.date[0]
    params.end = filters.value.date[1]
  }

  fetchPosts(params)
}

onMounted(fetchPosts)
</script>
