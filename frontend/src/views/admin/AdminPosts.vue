<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Posts</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-blue-700">Quản lý bài viết</h1>
      <a-button type="primary" class="bg-blue-600 border-blue-600" @click="openCreate">
        Thêm bài viết
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="posts"
      :loading="loading"
      :pagination="{ pageSize: 5 }"
      row-key="post_id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="openDetail(record)">Xem chi tiết</a-button>
          <a-popconfirm
            title="Xóa bài viết này?"
            ok-text="Xóa"
            cancel-text="Hủy"
            @confirm="handleDelete(record.post_id)"
          >
            <a-button type="link" danger size="small">Xóa</a-button>
          </a-popconfirm>
        </template>

        <template v-else-if="column.key === 'post_status'">
          <a-tag :color="statusColorMap[record.post_status]">
            {{ statusLabelMap[record.post_status] || record.post_status }}
          </a-tag>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="detailModalOpen"
      :title="selectedPost?.post_title || 'Chi tiết bài viết'"
      width="700px"
      :footer="null"
      destroyOnClose
    >
      <div v-if="selectedPost">
        <a-form layout="vertical" :model="selectedPost" name="updateForm" @finish="handleUpdate">
          <a-form-item label="Tiêu đề">
            <a-input v-model:value="selectedPost.post_title" />
          </a-form-item>

          <a-form-item label="Trạng thái">
            <a-select v-model:value="selectedPost.post_status">
              <a-select-option value="published">Đã đăng</a-select-option>
              <a-select-option value="draft">Chờ duyệt</a-select-option>
              <a-select-option value="rejected">Từ chối</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="selectedPost.post_status === 'rejected'" label="Lý do từ chối">
            <a-input v-model:value="selectedPost.reject_reason" placeholder="Nhập lý do từ chối" />
          </a-form-item>

          <a-form-item label="Nội dung">
            <quill-editor
              v-model:content="selectedPost.post_content"
              contentType="html"
              style="min-height: 200px"
            />
          </a-form-item>

          <a-form-item label="Hình ảnh bài viết">
            <input type="file" accept="image/*" @change="onImageChange" />
            <div v-if="selectedPost.post_images?.length" class="flex flex-wrap gap-2 mt-3">
              <div
                v-for="(img, index) in selectedPost.post_images"
                :key="index"
                class="relative w-28 h-28 rounded border overflow-hidden"
              >
                <img :src="img" class="w-full h-full object-cover" />
                <a-button
                  size="small"
                  danger
                  class="absolute top-1 right-1 z-10"
                  @click="removeImage(index)"
                  >X</a-button
                >
              </div>
            </div>
          </a-form-item>

          <div class="flex justify-end gap-2">
            <a-button
              @click="
                () => {
                  detailModalOpen.value = false
                  isCreating.value = false
                }
              "
              >Hủy</a-button
            >
            <a-button type="primary" html-type="submit">Lưu thay đổi</a-button>
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

const statusLabelMap = {
  published: 'Đã đăng',
  draft: 'Nháp',
  rejected: 'Từ chối',
}

const statusColorMap = {
  published: 'green',
  draft: 'orange',
  rejected: 'red',
}

const columns = [
  { title: 'Tiêu đề', dataIndex: 'post_title', key: 'post_title' },
  { title: 'Trạng thái', dataIndex: 'post_status', key: 'post_status' },
  {
    title: 'Ngày đăng',
    dataIndex: 'post_create_at',
    key: 'post_create_at',
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  {
    title: 'Ngày duyệt',
    dataIndex: 'post_update_at',
    key: 'post_update_at',
    customRender: ({ text }) => dayjs(text).format('HH:mm DD/MM/YYYY'),
  },
  { title: 'Thao tác', key: 'actions' },
]

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await postsService.getAllPosts({ limit: 100 })
    posts.value = Array.isArray(res.data?.items) ? res.data.items : []
  } catch {
    message.error('Không thể tải bài viết!')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedPost.value = {
    post_title: '',
    post_status: 'published',
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
  detailModalOpen.value = true
}

const onImageChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (!selectedPost.value.post_images) {
      selectedPost.value.post_images = []
    }
    selectedPost.value.post_images.push(reader.result)
  }
  reader.readAsDataURL(file)
}

const removeImage = (index) => {
  selectedPost.value.post_images.splice(index, 1)
}

const handleUpdate = async () => {
  try {
    const payload = {
      post_id: selectedPost.value.post_id,
      post_title: selectedPost.value.post_title,
      post_content: selectedPost.value.post_content,
      post_slug: selectedPost.value.post_slug,
      post_images: selectedPost.value.post_images,
      tag_id: selectedPost.value.tag_id || [],
    }

    if (isCreating.value) {
      payload.post_status = selectedPost.value.post_status
      const res = await postsService.createPost(payload)
      const newPost = res?.data || res
      posts.value.unshift(newPost)
      message.success('Đã thêm bài viết')
    } else {
      await postsService.updatePost(payload.post_id, payload)

      if (selectedPost.value.post_status === 'rejected' && !selectedPost.value.reject_reason) {
        message.warning('Vui lòng nhập lý do từ chối')
        return
      }

      await postsService.reviewPost(payload.post_id, {
        action: selectedPost.value.post_status === 'published' ? 'approve' : 'reject',
        reason: selectedPost.value.reject_reason || ''
      })

      const idx = posts.value.findIndex(p => p.post_id === payload.post_id)
      if (idx !== -1)
        posts.value[idx] = {
          ...posts.value[idx],
          ...payload,
          post_status: selectedPost.value.post_status
        }

      message.success('Cập nhật thành công')
    }

    detailModalOpen.value = false
    isCreating.value = false
  } catch (err) {
    console.error('Lỗi:', err)
    message.error(isCreating.value ? 'Thêm thất bại!' : 'Cập nhật thất bại!')
  }
}

const handleDelete = async (post_id) => {
  try {
    await postsService.deletePost(post_id)
    posts.value = posts.value.filter((p) => p.post_id !== post_id)
    message.success('Đã xóa bài viết')
  } catch {
    message.error('Xóa thất bại!')
  }
}

onMounted(fetchPosts)
</script>
