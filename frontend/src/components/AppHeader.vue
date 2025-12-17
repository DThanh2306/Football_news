<template>
  <header class="bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm sticky top-0 z-50">
    <div
      class="flex items-center justify-between px-6 py-3 text-sm text-gray-700 max-w-7xl mx-auto"
    >
      <div class="flex items-center gap-3">
        <router-link to="/">
          <img src="/logo.png" alt="Logo" class="h-20 w-auto drop-shadow" />
        </router-link>
      </div>

      <div class="flex items-center gap-5">
        <span class="text-gray-500">{{ today }}</span>
        <router-link
          to="/"
          class="border border-blue-300 px-3 py-1 rounded-full hover:bg-blue-100 transition text-sm text-blue-700 font-semibold"
        >
          🌐 Latest News
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative">
          <input
            v-model="searchText"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="CR7, MU, Serie A..."
            class="pl-4 pr-10 py-1.5 border border-blue-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
          />
          <button
            class="absolute right-1.5 top-[5px] text-blue-500 text-base"
            @click="handleSearch"
          >
            🔍
          </button>
        </div>

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
              <a-button
                type="primary"
                class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
              >
                {{ user?.username }}
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </template>
          <template v-else>
            <router-link>
              <a-button
                type="primary"
                class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                @click="openLogin"
                >Login</a-button
              >
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <nav
      class="flex items-center justify-between gap-6 px-6 py-3 text-sm max-w-7xl mx-auto font-semibold text-gray-700 overflow-x-auto whitespace-nowrap border-t border-blue-200 bg-blue-50 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm sticky top-0 z-50"
    >
      <router-link to="/" :class="navClass('/')">Home</router-link>
      <router-link to="/posts" :class="navClass('/posts')">Latest News</router-link>
      <router-link to="/schedule" :class="navClass('/schedule')">Schedule</router-link>
      <router-link to="/standings" :class="navClass('/standings')">Scoreboard</router-link>
      <a-dropdown trigger="hover">
        <a class="ant-dropdown-link" @click.prevent>
          League ▾
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item v-for="l in leagues" :key="l.league_id">
              <router-link :to="`/league/${l.league_slug}`">{{ l.league_name }}</router-link>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </nav>
    <loginForm ref="authModal" />
  </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons-vue'
import loginForm from '@/components/LoginForm.vue'
import { leaguesService } from '@/services/leagues.service'
import { tagsService } from '@/services/tags.service'

dayjs.locale('vi')
const today = dayjs().format('dddd, hh:mm, DD/MM/YYYY')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const authModal = ref(null)
const searchText = ref('')
const leagues = ref([])
const tags = ref([])

const openLogin = () => {
  authModal.value.open()
}

const isLoggedIn = computed(() => !!auth.token)
const user = computed(() => auth.user)

const navClass = (path) => {
  return route.path.startsWith(path)
    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
    : 'hover:text-blue-600 transition pb-1'
}

const goToProfile = () => router.push('/profile')
const goToAdmin = () => router.push('/admin')

function handleSearch() {
  if (!searchText.value.trim()) return
  router.push({ path: '/posts', query: { q: searchText.value.trim() } })
}

const handleLogout = () => {
  auth.logout()
}

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
