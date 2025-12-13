<!-- eslint-disable no-unused-vars -->
<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Users</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-blue-800 tracking-tight">Manage Users</h1>
      <div class="flex items-center gap-2">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="Search by username or email"
          allow-clear
          enter-button
          @search="triggerSearch"
          style="width: 280px"
        />
        <a-select
          v-model:value="roleFilter"
          placeholder="Filter by role"
          allow-clear
          style="width: 180px"
        >
          <a-select-option value="chief_editor">chief_editor</a-select-option>
          <a-select-option value="editor">editor</a-select-option>
          <a-select-option value="league_manager">league_manager</a-select-option>
          <a-select-option value="user">user</a-select-option>
        </a-select>
        <a-button @click="refresh" :loading="loading">Refresh</a-button>
        <a-button v-if="isChief" type="primary" class="bg-blue-600 border-blue-600" @click="openAdd"
          >Add user</a-button
        >
      </div>
    </div>

    <a-table
      class="overflow-auto shadow-sm border rounded-lg shadow-sm bg-white overflow-y-auto"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :pagination="pagination"
      :scroll="tableScroll"
      :row-key="(row) => row.user_id || row.id"
      bordered
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'avatar'">
          <img
            :src="record.avatar || defaultAvatar"
            alt="avatar"
            class="w-10 h-10 object-cover rounded-full border shadow"
          />
        </template>

        <template v-else-if="column.key === 'email'">
          <a :href="`mailto:${record.email}`" class="text-blue-600 hover:underline">{{
            record.email
          }}</a>
        </template>

        <template v-else-if="column.key === 'role'">
          <a-tag :color="roleColor(record.role)">{{ record.role }}</a-tag>
        </template>

        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="viewUser(record)">View details</a-button>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="showModal"
      :title="addMode ? 'Add new user' : 'User details'"
      :footer="null"
      width="880"
      :bodyStyle="{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: '0' }"
      :style="{ top: '20px' }"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <template v-if="isChief">
          <div class="md:col-span-3">
            <a-alert type="info" show-icon>
              <template #message>{{ addMode ? 'Create user' : 'Chief Editor' }}</template>
              <template #description>
                <span v-if="addMode">Fill user info and set a temporary password.</span>
                <span v-else>You can edit this user's information and reset the password.</span>
              </template>
            </a-alert>
          </div>
        </template>
        <div class="flex flex-col items-center border-r md:col-span-1">
          <img
            :src="selectedUser.avatar || defaultAvatar"
            class="w-24 h-24 rounded-full border mb-3"
          />
          <h2 class="text-lg font-bold">{{ selectedUser.username }}</h2>
          <p class="text-sm text-gray-500 break-all">
            <a :href="`mailto:${selectedUser.email}`" class="text-blue-600 hover:underline">{{
              selectedUser.email
            }}</a>
          </p>
          <a-tag :color="roleColor(selectedUser.role)" class="mt-2">{{ selectedUser.role }}</a-tag>
          <div class="mt-4 text-sm text-gray-600 space-y-1 w-full">
            <a-descriptions size="small" :column="1" bordered>
              <a-descriptions-item label="Posts">{{
                selectedUser.postsCount ?? 0
              }}</a-descriptions-item>
              <a-descriptions-item label="Comments">{{
                selectedUser.commentsCount ?? 0
              }}</a-descriptions-item>
              <a-descriptions-item label="Phone">{{
                selectedUser.phone || '—'
              }}</a-descriptions-item>
              <a-descriptions-item label="Address">{{
                selectedUser.address || '—'
              }}</a-descriptions-item>
              <a-descriptions-item label="Created at">{{
                formatDate(selectedUser.created_at)
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>

        <div class="md:col-span-2">
          <a-tabs v-model:activeKey="detailTab">
            <a-tab-pane key="profile" tab="Profile">
              <a-form ref="formRef" :model="selectedUser" layout="vertical" :disabled="!isChief">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <a-form-item label="Username" name="username" :rules="[
                   { required: true, message: 'Username is required', trigger: 'blur' },
                   { validator: validateUsernameUnique, trigger: 'blur' }
                 ]" :validate-trigger="['blur']">
                   <a-input v-model:value="selectedUser.username" :disabled="!addMode" />
                 </a-form-item>
                 <a-form-item label="Email" name="email" :rules="[
                   { required: true, type: 'email', message: 'Valid email is required', trigger: 'blur' },
                   { validator: validateEmailUnique, trigger: 'blur' }
                 ]" :validate-trigger="['blur']">
                   <a-input v-model:value="selectedUser.email" />
                 </a-form-item>
                 <a-form-item label="Phone"><a-input v-model:value="selectedUser.phone" /></a-form-item>
                 <a-form-item label="Address"><a-input v-model:value="selectedUser.address" /></a-form-item>
                 <a-form-item label="Avatar URL"><a-input v-model:value="selectedUser.avatar" /></a-form-item>
                 <a-form-item label="Role">
                   <a-select v-model:value="selectedUser.role" :disabled="!isChief">
                     <a-select-option value="chief_editor">chief_editor</a-select-option>
                     <a-select-option value="editor">editor</a-select-option>
                     <a-select-option value="league_manager">league_manager</a-select-option>
                     <a-select-option value="user">user</a-select-option>
                   </a-select>
                 </a-form-item>
                 <a-form-item v-if="selectedUser.role === 'league_manager'" label="League">
                   <a-select v-model:value="selectedUser.league_id" placeholder="Select league">
                     <a-select-option v-for="l in leagues" :key="l.league_id" :value="l.league_id">
                       {{ l.league_name }}
                     </a-select-option>
                   </a-select>
                 </a-form-item>
                 <a-form-item v-if="addMode" label="Temporary password" name="tempPassword" :rules="[{ required: true, min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }]" :validate-trigger="['blur']">
                   <a-input-password v-model:value="selectedUser.tempPassword" placeholder="Enter a temporary password" />
                 </a-form-item>
               </div>
               <div class="flex justify-end gap-2">
                 <a-popconfirm
                   v-if="isChief && !addMode"
                   title="Reset this user's password?"
                   @confirm="resetPassword"
                 >
                   <a-button danger>Reset password</a-button>
                 </a-popconfirm>
                 <a-button v-if="isChief" type="primary" :loading="savingUser" @click="addMode ? createUser() : saveUser()" class="bg-blue-600">
                   {{ addMode ? 'Create' : 'Save' }}
                 </a-button>
               </div>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="posts" tab="Posts">
              <a-spin :spinning="loadingDetail.posts">
                <div
                  class="bg-white rounded border shadow-sm overflow-y-auto"
                  style="max-height: 52vh"
                >
                  <template v-if="detailPosts.length">
                    <div
                      v-for="(p, idx) in detailPosts"
                      :key="p.post_id"
                      class="flex gap-3 p-3 items-start"
                      :class="{ 'border-t border-gray-100': idx > 0 }"
                    >
                      <img
                        :src="(p.post_images && p.post_images[0]) || '/default-thumb.jpg'"
                        class="w-16 h-16 object-cover rounded border"
                        alt="thumb"
                      />
                      <div class="flex-1 min-w-0">
                        <router-link
                          :to="'/post/' + p.post_slug"
                          class="text-blue-800 hover:underline font-semibold line-clamp-2"
                        >
                          {{ p.post_title }}
                        </router-link>
                        <div class="text-xs text-gray-400 mt-1 truncate">
                          {{ formatDate(p.post_create_at) }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <div v-else class="p-4 text-gray-400">No posts.</div>
                </div>
              </a-spin>
            </a-tab-pane>

            <a-tab-pane key="comments" tab="Comments">
              <a-spin :spinning="loadingDetail.comments">
                <ul class="space-y-3">
                  <li v-for="c in detailComments" :key="c.cmt_id">
                    <div class="text-gray-800">{{ c.cmt_content }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      Post:
                      <router-link
                        :to="'/post/' + c.post_slug"
                        class="text-blue-600 hover:underline"
                      >
                        {{ c.post_title || '#' + c.post_id }}
                      </router-link>
                      &nbsp;|&nbsp;{{ formatDate(c.cmt_create_at) }}
                    </div>
                  </li>
                  <li v-if="!detailComments.length" class="text-gray-400">No comments.</li>
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { message } from 'ant-design-vue'
import { usersService } from '@/services/users.service'
import { postsService } from '@/services/posts.service'
import { commentsService } from '@/services/comments.service'
import { useAuthStore } from '@/stores/auth'
import { leaguesService } from '@/services/leagues.service'
import { leagueManagersService } from '@/services/leagueManagers.service'

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

// Toolbar states
const searchKeyword = ref('')
const roleFilter = ref()
const triggerSearch = () => { pagination.value.current = 1 }
const refresh = () => { queryRefetch && queryRefetch() }

function roleColor(role) {
  switch (role) {
    case 'chief_editor':
      return 'red'
    case 'editor':
      return 'blue'
    case 'league_manager':
      return 'green'
    case 'user':
      return 'default'
    default:
      return 'default'
  }
}

const columns = [
  { title: 'Avatar', dataIndex: 'avatar', key: 'avatar' },
  { title: 'Username', dataIndex: 'username', key: 'username' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Posts', dataIndex: 'postsCount', key: 'postsCount' },
  { title: 'Comments', dataIndex: 'commentsCount', key: 'commentsCount' },
  { title: 'Actions', key: 'actions' },
]

// data from TanStack Query
let queryRefetch // defined after useQuery
let usersDataRef
let isLoadingRef
let isFetchingRef

const data = computed(() => usersDataRef?.value?.items || [])
const loading = computed(() => (isLoadingRef?.value || isFetchingRef?.value))

const pagination = ref({ current: 1, pageSize: 10, total: 0, showSizeChanger: true })
const tableScroll = ref({ y: 'calc(100vh - 220px)' })

const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
  // queryKey depends on pagination, so it will auto-refetch
}

const auth = useAuthStore()
const isChief = computed(() => auth.user?.role === 'chief_editor')

const leagues = ref([])

const showModal = ref(false)
const addMode = ref(false)
// move temp password into selectedUser model for proper form validation
// const tempPassword = ref('')
const formRef = ref()
const savingUser = ref(false)

// async validators for unique checks
async function validateUsernameUnique(_rule, value) {
  if (!value || !addMode.value) return Promise.resolve()
  try {
    const res = await usersService.searchUsers({ username: value, email: '' })
    const list = res?.data || res || []
    const exists = Array.isArray(list) && list.some(u => u.username === value)
    return exists ? Promise.reject('Username already exists') : Promise.resolve()
  } catch {
    return Promise.resolve() // fail-open: do not block form if search fails
  }
}

async function validateEmailUnique(_rule, value) {
  if (!value || !addMode.value) return Promise.resolve()
  try {
    const res = await usersService.searchUsers({ username: '', email: value })
    const list = res?.data || res || []
    const exists = Array.isArray(list) && list.some(u => u.email === value)
    return exists ? Promise.reject('Email already exists') : Promise.resolve()
  } catch {
    return Promise.resolve()
  }
}
const selectedUser = ref({})
const detailTab = ref('posts')

const detailPosts = ref([])
const detailComments = ref([])
const loadingDetail = reactive({ posts: false, comments: false })

// TanStack Query: fetch & client-side filter/paginate
async function fetchUsersQuery({ queryKey }) {
  const [_key, { page, limit, role, q }] = queryKey
  try {
    const res = await usersService.getAll()
    let list = (res?.data || res || []).map((u) => ({
      ...u,
      user_id: u.user_id ?? u.id,
      id: u.user_id ?? u.id,
    }))
    if (role) list = list.filter((u) => u.role === role)
    const kw = (q || '').toLowerCase().trim()
    if (kw) {
      list = list.filter((u) =>
        (u.username?.toLowerCase().includes(kw)) ||
        (u.email?.toLowerCase().includes(kw))
      )
    }
    const total = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const items = list.slice(start, end)
    return { items, total }
  } catch (e) {
    message.error('Failed to load users')
    return { items: [], total: 0 }
  }
}

// Setup TanStack Query
const queryKey = computed(() => ([
  'admin-users',
  {
    page: pagination.value.current,
    limit: pagination.value.pageSize,
    role: roleFilter.value || null,
    q: searchKeyword.value || '',
  },
]))

const { data: usersData, isLoading, isFetching, refetch } = useQuery({
  queryKey,
  queryFn: fetchUsersQuery,
  keepPreviousData: true,
})
usersDataRef = usersData
isLoadingRef = isLoading
isFetchingRef = isFetching
queryRefetch = refetch

watch(usersData, (val) => {
  if (typeof val?.total === 'number') {
    pagination.value.total = val.total
  }
})

function openAdd() {
  addMode.value = true
  showModal.value = true
  selectedUser.value = {
    username: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    role: 'user',
    league_id: null,
    tempPassword: '',
  }
  detailTab.value = 'profile'
  leaguesService.getAllLeagues()
    .then(res => { leagues.value = res?.data || res || [] })
    .catch(() => { leagues.value = [] })
}

const viewUser = async (record) => {
  selectedUser.value = {
    ...record,
    user_id: record.user_id ?? record.id,
    id: record.user_id ?? record.id,
  }
  detailTab.value = 'profile'
  showModal.value = true
  try {
    const res = await leaguesService.getAllLeagues()
    leagues.value = res?.data || res || []
  } catch {
    leagues.value = []
  }
  loadUserPosts()
}

const loadUserPosts = async () => {
  loadingDetail.posts = true
  try {
    const uid = selectedUser.value.user_id ?? selectedUser.value.id
    if (!uid) {
      detailPosts.value = []
      return
    }
    const res = await postsService.getPostByUserId(uid)
    const items = res?.data?.items || res?.data || res?.items || []
    detailPosts.value = items
  } catch {
    detailPosts.value = []
  } finally {
    loadingDetail.posts = false
  }
}

const loadUserComments = async () => {
  loadingDetail.comments = true
  try {
    const uid = selectedUser.value.user_id ?? selectedUser.value.id
    if (!uid) {
      detailComments.value = []
      return
    }
    const { data } = await commentsService.getCommentByUserId(uid)
    detailComments.value = data || []
  } catch {
    detailComments.value = []
  } finally {
    loadingDetail.comments = false
  }
}

watch(detailTab, (tab) => {
  if (!(selectedUser.value.user_id || selectedUser.value.id)) return
  if (tab === 'posts') loadUserPosts()
  if (tab === 'comments') loadUserComments()
})

function formatDate(d) {
  if (!d) return '—'
  const t = new Date(d)
  return isNaN(t.getTime()) ? d : t.toLocaleDateString()
}

const saveUser = async () => {
  if (!isChief.value) {
    message.warning('You do not have permission to edit users')
    return
  }
  try {
    const u = selectedUser.value
    const payload = {
      email: u.email,
      phone: u.phone,
      address: u.address,
      avatar: u.avatar,
      role: u.role,
    }
    await usersService.adminUpdateUser(u.username, payload)

    // If league_manager and league selected, assign
    const uid = u.user_id ?? u.id
    if (u.role === 'league_manager' && u.league_id && uid) {
      try {
        await leagueManagersService.assign({ user_id: uid, league_id: u.league_id })
      } catch (e) {
        const detail = e?.response?.data?.message || 'Assign failed'
        message.warning(detail)
      }
    }

    message.success('User updated successfully')
    await queryRefetch()
  } catch (e) {
    const detail = e?.response?.data?.message || 'Update failed'
    message.error(detail)
  }
}

const createUser = async () => {
  if (!isChief.value) {
    message.warning('You do not have permission to add users')
    return
  }
  const u = selectedUser.value
  if (!u.username || !u.email || !u.tempPassword) {
    message.warning('Username, email and temporary password are required')
    return
  }
  try {
    // basic manual validation for add mode
    if (addMode.value) {
      if (!selectedUser.value.username || !selectedUser.value.email || !selectedUser.value.tempPassword || selectedUser.value.tempPassword.length < 6) {
        message.warning('Please fill username, valid email and password (min 6 chars)')
        return
      }
    }
    savingUser.value = true
    // Single admin create user call
    const res = await usersService.adminCreateUser({
      username: u.username,
      email: u.email,
      password: u.tempPassword,
      role: u.role,
      phone: u.phone,
      address: u.address,
      avatar: u.avatar,
    })
    const created = res?.data?.user || res?.user || res
    const createdUserId = created?.user_id ?? created?.id

    // Assign LM if needed
    if (u.role === 'league_manager' && u.league_id && createdUserId) {
      try {
        await usersService.assignLeagueManager({ user_id: createdUserId, league_id: u.league_id })
      } catch (e) {
        const detail = e?.response?.data?.message || 'Assign failed'
        message.warning(detail)
      }
    }

    message.success('User created successfully')
    addMode.value = false
    showModal.value = false
    await queryRefetch()
  } catch (e) {
    const detail = e?.response?.data?.message || 'Create user failed'
    console.log(e)
    message.error(detail)
  } finally {
    savingUser.value = false
  }
}

const resetPassword = async () => { 
  if (!isChief.value) return
  try {
    const u = selectedUser.value
    await usersService.changePassword({ targetUsername: u.username, newPassword: 'thanh123' })
    message.success('Password reset for ' + u.username)
  } catch (e) {
    message.error('You do not have permission to reset password')
    message.error('Reset password failed')
  }
}

// useQuery auto-runs based on queryKey; no manual onMounted fetch

</script>
