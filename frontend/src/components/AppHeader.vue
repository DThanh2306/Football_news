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
          🌐 Mới nhất
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative">
          <input
            v-model="searchText"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="Tìm kiếm..."
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
                    Hồ sơ
                  </a-menu-item>
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined />
                    Đăng xuất
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
                >Đăng nhập</a-button
              >
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <nav
      class="flex items-center justify-between gap-6 px-6 py-3 text-sm max-w-7xl mx-auto font-semibold text-gray-700 overflow-x-auto whitespace-nowrap border-t border-blue-200 bg-blue-50 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm sticky top-0 z-50"
    >
      <router-link to="/" :class="navClass('/')">Trang chủ</router-link>
      <router-link to="/posts" :class="navClass('/posts')">Tin mới nhất</router-link>
      <router-link to="/tags" :class="navClass('/tags')">Chuyển nhượng</router-link>
      <!-- <router-link to="/schedule" :class="navClass('/schedule')">Lịch thi đấu</router-link> -->
      <router-link to="/league/champions-league" :class="navClass('/league/champions-league')"
        >Champions League</router-link
      >
      <router-link to="/league/europa-league" :class="navClass('/league/europa-league')"
        >Europa League</router-link
      >
      <router-link to="/league/premier-league" :class="navClass('/league/premier-league')"
        >Premier League</router-link
      >
      <router-link to="/league/la-liga" :class="navClass('/league/la-liga')">La Liga</router-link>
      <router-link to="/league/serie-a" :class="navClass('/league/serie-a')">Serie A</router-link>
      <router-link to="/league/bundesliga" :class="navClass('/league/bundesliga')"
        >Bundesliga</router-link
      >
      <router-link to="/league/ligue-1" :class="navClass('/league/ligue-1')">Ligue 1</router-link>
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

dayjs.locale('vi')
const today = dayjs().format('dddd, hh:mm, DD/MM/YYYY')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const authModal = ref(null)
const searchText = ref('')

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

function handleSearch() {
  if (!searchText.value.trim()) return
  router.push({ path: '/posts', query: { q: searchText.value.trim() } })
}

const handleLogout = () => {
  auth.logout()
}
</script>
