<template>
  <div class="flex">
    <LoginForm ref="loginRef" />
    <aside class="w-60 bg-white sticky shadow-lg flex flex-col py-6 px-2">
      <div class="text-xl font-bold text-blue-700 mb-8 px-4">Admin Dashborad</div>
      <nav class="flex-1 flex flex-col gap-1">
        <router-link
          v-for="item in menu"
          :key="item.path"
          :to="item.path"
          class="px-4 py-2 rounded text-gray-700 font-medium hover:bg-blue-50"
          :class="{ 'bg-blue-100 text-blue-700 font-semibold': $route.path === item.path }"
        >
          <span class="mr-2">{{ item.icon }}</span>{{ item.label }}
        </router-link>
      </nav>
      <!-- Auth actions at bottom -->
      <div class="mt-auto px-4 pt-4 border-t">
        <div v-if="auth.user" class="text-sm text-gray-600 mb-2">
          Đăng nhập: <span class="font-semibold">{{ auth.user.username }}</span>
        </div>
        <button
          v-if="auth.token"
          @click="onLogout"
          class="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
        <button
          v-else
          @click="openLogin()"
          class="w-full text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    </aside>
    <div class="w-full flex bg-gray-100">
      <main class="flex-1 p-0">
        <router-view />
      </main>
    </div>
  </div>
  <!-- Block overlay for basic user role -->
  <div v-if="auth.user && auth.user.role === 'user'" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
      <div class="text-2xl font-bold text-red-600 mb-2">Không có quyền truy cập</div>
      <p class="text-gray-600 mb-6">Tài khoản của bạn không có quyền vào khu vực quản trị.</p>
      <div class="flex gap-3 justify-center">
        <button @click="goHome" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Về trang chủ</button>
        <button @click="onLogout" class="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white">Đăng xuất</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'

const menu = [
  { label: 'Dashboard', path: '/admin', icon: '🏠' },
  { label: 'Người dùng', path: '/admin/users', icon: '👤' },
  { label: 'Bài viết', path: '/admin/posts', icon: '📝' },
  { label: 'Bình luận', path: '/admin/comments', icon: '💬' },
  { label: 'Giải đấu', path: '/admin/leagues', icon: '🏆' },
  { label: 'Lịch thi đấu', path: '/admin/matches', icon: '📅' },
  { label: 'Câu lạc bộ', path: '/admin/clubs', icon: '⚽' },
  { label: 'Cầu thủ', path: '/admin/players', icon: '🥇' },
  // { label: 'Cài đặt', path: '/admin/settings', icon: '⚙️' }
]

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const loginRef = ref(null)

function openLogin() {
  loginRef.value?.open()
}

onMounted(() => {
  if (!auth.token) {
    openLogin()
  }
})

watch(
  () => [auth.token, auth.user?.role],
  ([token, role]) => {
    // Khi logout và vẫn ở admin => mở modal
    if (!token && route.path.startsWith('/admin')) {
      openLogin()
      return
    }
    // Nếu là role user nhưng có token => không mở modal đăng nhập, chỉ hiển thị overlay chặn
  },
  { deep: true }
)

function onLogout() {
  auth.logout()
  openLogin()
}

function goHome() {
  router.push({ name: 'home' })
}
</script>
