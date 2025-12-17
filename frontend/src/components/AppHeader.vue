<template>
  <header class="sticky top-0 z-50 backdrop-blur supports-backdrop-blur:bg-white/80 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800 theme-transition">
    <div class="flex items-center justify-between px-4 md:px-6 py-3 max-w-7xl mx-auto">
      <!-- Left: logo -->
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" class="h-10 w-auto" />
          <span class="hidden sm:block text-base font-semibold text-slate-800 dark:text-slate-100">Football News</span>
        </router-link>
      </div>

      <!-- Center: date + quick link -->
      <div class="hidden md:flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span class="opacity-80">{{ today }}</span>
        <router-link
          to="/"
          class="px-3 py-1 rounded-full border border-slate-300/60 dark:border-slate-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 theme-transition"
        >
          🌐 Latest News
        </router-link>
      </div>

      <!-- Right: search + auth + theme -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchText"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="CR7, MU, Serie A..."
            class="pl-4 pr-9 py-1.5 border border-slate-300/70 dark:border-slate-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 theme-transition bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          />
          <button
            class="absolute right-2 top-1.5 text-primary-600 dark:text-primary-400 text-base"
            @click="handleSearch"
            aria-label="Search"
          >
            🔍
          </button>
        </div>

        <!-- Theme toggle -->
        <button @click="toggleTheme" class="w-9 h-9 rounded-full border border-slate-300/70 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 theme-transition" :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>

        <div>
          <template v-if="isLoggedIn">
            <a-dropdown trigger="hover" overlayClassName="z-[9999]">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile" @click="goToProfile">
                    <UserOutlined />
                    profile
                  </a-menu-item>
                  <a-menu-item v-if="user?.role && user.role !== 'user'" key="admin" @click="goToAdmin">
                    🛠️
                    Admin Panel
                  </a-menu-item>
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined />
                    Logout
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="primary" class="bg-primary-600 border-primary-600 hover:bg-primary-700 hover:border-primary-700">
                {{ user?.username }}
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </template>
          <template v-else>
            <router-link>
              <a-button type="primary" class="bg-primary-600 border-primary-600 hover:bg-primary-700 hover:border-primary-700" @click="openLogin">Login</a-button>
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <nav class="max-w-7xl mx-auto px-4 md:px-6 pb-3 -mt-2">
      <div class="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <router-link to="/" :class="navClass('/')" class="px-3 py-1.5 rounded-full border theme-transition">Home</router-link>
        <router-link to="/posts" :class="navClass('/posts')" class="px-3 py-1.5 rounded-full border theme-transition">Latest News</router-link>
        <router-link to="/schedule" :class="navClass('/schedule')" class="px-3 py-1.5 rounded-full border theme-transition">Schedule</router-link>
        <router-link to="/standings" :class="navClass('/standings')" class="px-3 py-1.5 rounded-full border theme-transition">Scoreboard</router-link>
        <a-dropdown trigger="hover">
          <a class="ant-dropdown-link px-3 py-1.5 rounded-full border theme-transition" @click.prevent>
            League ▾
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="l in leagues" :key="l.league_id">
                <router-link :to="'/league/' + l.league_slug">{{ l.league_name }}</router-link>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </nav>
    <loginForm ref="authModal" />
  </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons-vue'
import loginForm from '@/components/LoginForm.vue'
import { leaguesService } from '@/services/leagues.service'

dayjs.locale('vi')
const today = dayjs().format('dddd, HH:mm, DD/MM/YYYY')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const authModal = ref(null)
const searchText = ref('')
const leagues = ref([])

const openLogin = () => { authModal.value.open() }

const isLoggedIn = computed(() => !!auth.token)
const user = computed(() => auth.user)

const isDark = ref(false)
function applyTheme(dark) {
  const root = document.documentElement
  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}
function toggleTheme() { isDark.value = !isDark.value; applyTheme(isDark.value) }

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) isDark.value = saved === 'dark'
  else isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(isDark.value)
})

const navClass = (path) => {
  const active = route.path.startsWith(path)
  return active
    ? 'bg-primary-600 text-white border-primary-600'
    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
}

const goToProfile = () => router.push('/profile')
const goToAdmin = () => router.push('/admin')

function handleSearch() {
  if (!searchText.value.trim()) return
  router.push({ path: '/posts', query: { q: searchText.value.trim() } })
}

const handleLogout = () => { auth.logout() }

// load leagues for header nav dynamically
;(async () => {
  try {
    const res = await leaguesService.getAllLeagues()
    leagues.value = Array.isArray(res?.data) ? res.data : res
  } catch (e) {
    leagues.value = []
    console.error('Cannot load League', e)
  }
})()
</script>
