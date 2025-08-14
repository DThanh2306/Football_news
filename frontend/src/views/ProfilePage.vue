<template>
  <div class="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

    <div class="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 flex flex-col items-center md:col-span-1">
      <img :src="me.avatar || defaultAvatar" alt="avatar" class="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow mb-4" />
      <h2 class="text-2xl font-bold text-blue-700 mb-1">{{ me.username || '—' }}</h2>
      <p class="text-gray-500 mb-2 break-all">{{ me.email || '—' }}</p>

      <div class="w-full mt-4 flex flex-col gap-2">
        <button
          class="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition font-semibold"
          :class="{ 'ring-2 ring-blue-400': tab === 'posts' }"
          @click="switchTo('posts')"
        >
          <span>Bài viết</span>
          <span class="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">{{ counts.posts }}</span>
        </button>

        <button
          class="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition font-semibold"
          :class="{ 'ring-2 ring-blue-400': tab === 'comments' }"
          @click="switchTo('comments')"
        >
          <span>Bình luận</span>
          <span class="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">{{ counts.comments }}</span>
        </button>
      </div>

      <a-button type="primary" class="mt-6 bg-blue-600 border-blue-600 w-full" @click="tab = 'edit'">
        Chỉnh sửa thông tin
      </a-button>

      <div class="w-full mt-6 text-sm text-gray-500 space-y-2">
        <div class="flex items-center justify-between">
          <span>Điện thoại</span>
          <span class="font-medium">{{ me.phone || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Địa chỉ</span>
          <span class="font-medium text-right truncate max-w-[55%]" :title="me.address">{{ me.address || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Quyền</span>
          <a-tag color="blue">{{ me.role || 'user' }}</a-tag>
        </div>
        <div class="flex items-center justify-between">
          <span>Ngày tham gia</span>
          <span class="font-medium">{{ formatDate(me.created_at) }}</span>
        </div>
      </div>
    </div>

    <div class="md:col-span-2">

      <div v-if="tab === 'edit'" class="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <h3 class="text-xl font-bold text-blue-700 mb-4">Cập nhật thông tin cá nhân</h3>
        <a-form layout="vertical" :model="form" @finish="onSubmit" :disabled="loading.save">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a-form-item label="Tên người dùng">
              <a-input v-model:value="form.username" disabled />
            </a-form-item>
            <a-form-item label="Email" name="email" :rules="[{ required: true, message: 'Vui lòng nhập email' }]">
              <a-input v-model:value="form.email" />
            </a-form-item>
            <a-form-item label="Điện thoại">
              <a-input v-model:value="form.phone" />
            </a-form-item>
            <a-form-item label="Địa chỉ" class="md:col-span-2">
              <a-input v-model:value="form.address" />
            </a-form-item>
            <a-form-item label="Ảnh đại diện">
              <input type="file" accept="image/*" @change="onFileChange" />
              <div v-if="form.avatar" class="mt-3">
                <img :src="form.avatar" alt="preview" class="w-16 h-16 object-cover rounded-full border shadow" />
              </div>
              <div class="mt-2">
                <a-button size="small" @click="uploadAvatar" :loading="loading.upload">Tải ảnh lên</a-button>
              </div>
            </a-form-item>
          </div>
          <div class="flex gap-2 justify-end">
            <a-button @click="resetForm" :disabled="loading.save">Hủy</a-button>
            <a-button type="primary" html-type="submit" class="bg-blue-600 border-blue-600" :loading="loading.save">Lưu</a-button>
          </div>
        </a-form>
      </div>

      <div v-else-if="tab === 'posts'" class="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-blue-700">Bài viết của bạn</h3>
          <a-spin :spinning="loading.posts" />
        </div>

        <div v-if="posts.items.length">
          <div v-for="post in posts.items" :key="post.post_id" class="mb-6 pb-4 border-b last:border-b-0 last:pb-0">
            <router-link :to="'/post/' + post.post_id" class="text-lg font-semibold text-blue-700 hover:underline">
              {{ post.post_title }}
            </router-link>
            <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{ post.post_content || '' }}</p>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(post.post_update_at || post.post_create_at) }}</div>
          </div>
          <div class="flex justify-end">
            <a-pagination :current="postQuery.page" :pageSize="postQuery.limit" :total="posts.total" @change="onPostPageChange" show-less-items />
          </div>
        </div>
        <div v-else class="text-gray-400">Bạn chưa có bài viết nào.</div>
      </div>

      <div v-else-if="tab === 'comments'" class="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-blue-700">Bình luận của bạn</h3>
          <a-spin :spinning="loading.comments" />
        </div>

        <div v-if="comments.items.length">
          <div v-for="c in comments.items" :key="c.cmt_id" class="mb-6 pb-4 border-b last:border-b-0 last:pb-0">
            <div class="text-gray-700">{{ c.cmt_content }}</div>
            <div class="text-xs text-gray-400 mt-1">
              Bài viết:
              <router-link :to="'/post/' + c.post_id" class="text-blue-600 hover:underline">
                {{ c.post_title || ('#' + c.post_id) }}
              </router-link>
              &nbsp;|&nbsp;{{ formatDate(c.cmt_create_at) }}
            </div>
          </div>
          <div class="flex justify-end">
            <a-pagination :current="cmtQuery.page" :pageSize="cmtQuery.limit" :total="comments.total" @change="onCmtPageChange" show-less-items />
          </div>
        </div>
        <div v-else class="text-gray-400">Bạn chưa có bình luận nào.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { usersService } from '@/services/users.service'
import { postsService } from '@/services/posts.service'
import { commentsService } from '@/services/comments.service'
import axios from '@/utils/axios'

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const tab = ref('posts')

const me = reactive({
  user_id: null,
  username: '',
  email: '',
  phone: '',
  address: '',
  role: 'user',
  avatar: '',
  created_at: ''
})

console.log('ProfilePage loaded', me);

const form = reactive({ username: '', email: '', phone: '', address: '', avatar: '' })
const fileBlob = ref(null)

const loading = reactive({ me: false, save: false, upload: false, posts: false, comments: false })

const posts = reactive({ items: [], total: 0 })
const comments = reactive({ items: [], total: 0 })

const postQuery = reactive({ page: 1, limit: 5 })
const cmtQuery  = reactive({ page: 1, limit: 5 })

const counts = reactive({ posts: 0, comments: 0 })

function formatDate(d) {
  if (!d) return '—'
  const t = new Date(d)
  return isNaN(t.getTime()) ? d : t.toLocaleDateString()
}

function syncForm() {
  form.username = me.username
  form.email    = me.email
  form.phone    = me.phone
  form.address  = me.address
  form.avatar   = me.avatar
}

async function loadMe() {
  loading.me = true
  try {
    const res = await usersService.getMe()
    let data = res?.data || res
    // Nếu API trả mảng thì lấy phần tử đầu tiên
    if (Array.isArray(data)) data = data[0] || {}
    Object.assign(me, data)
    syncForm()
  } catch  {
    message.error('Không tải được thông tin người dùng')
  } finally {
    loading.me = false
  }
}

async function loadMyPosts() {
  if (!me.user_id) return
  loading.posts = true

  try {
    const res = await postsService.getPostByUserId(me.user_id)
    const allPosts = res?.data || []

    posts.total = allPosts.length
    counts.posts = allPosts.length

    const start = (postQuery.page - 1) * postQuery.limit
    posts.items = allPosts.slice(start, start + postQuery.limit)
  } catch {
    message.error('Không tải được bài viết')
  } finally {
    loading.posts = false
  }
}

async function loadMyComments() {
  if (!me.user_id) return
  loading.comments = true

  try {
    const res = await commentsService.getCommentByUserId(me.user_id)
    const allComments = res?.data || []

    const sorted = allComments.sort((a, b) => new Date(b.cmt_create_at) - new Date(a.cmt_create_at))

    counts.comments = sorted.length
    comments.total = sorted.length
    const start = (cmtQuery.page - 1) * cmtQuery.limit
    comments.items = sorted.slice(start, start + cmtQuery.limit)
  } catch {
    message.error('Không tải được bình luận')
  } finally {
    loading.comments = false
  }
}


function onPostPageChange(p) {
  postQuery.page = p
  loadMyPosts()
}
function onCmtPageChange(p) {
  cmtQuery.page = p
  loadMyComments()
}

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  fileBlob.value = f
  const reader = new FileReader()
  reader.onload = (ev) => { form.avatar = ev.target.result }
  reader.readAsDataURL(f)
}

async function uploadAvatar() {
  if (!fileBlob.value) return message.warning('Chọn ảnh trước')
  loading.upload = true
  try {
    const fd = new FormData()
    fd.append('file', fileBlob.value)
    const { data } = await axios.post('/uploads/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.avatar = data?.data?.url ?? data?.url ?? form.avatar
    message.success('Tải ảnh lên thành công')
  } catch  {
    message.error('Tải ảnh lên thất bại')
  } finally {
    loading.upload = false
  }
}

async function onSubmit() {
  loading.save = true
  try {
    const payload = { email: form.email, phone: form.phone, address: form.address, avatar: form.avatar }
    await usersService.updateMe(payload)
    Object.assign(me, payload)
    message.success('Cập nhật thành công')
    tab.value = 'posts'
    await loadMyPosts()
  } catch  {
    message.error('Cập nhật thất bại')
  } finally {
    loading.save = false
  }
}

function resetForm() {
  syncForm()
  message.info('Đã hoàn tác')
}

function switchTo(next) {
  tab.value = next
  if (next === 'posts') {
    postQuery.page = 1
    loadMyPosts()
  } else if (next === 'comments') {
    cmtQuery.page = 1
    loadMyComments()
  }
}

onMounted(async () => {
  await loadMe()
  await loadMyPosts()
  await loadMyComments()
})
</script>
