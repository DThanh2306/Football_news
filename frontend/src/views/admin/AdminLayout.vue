<template>
  <div class="flex">
      <aside class="w-60 bg-white sticky shadow-lg flex flex-col py-6 px-2">
      <div class=" text-xl font-bold text-blue-700 mb-8 px-4">Admin Dashborad</div>
      <nav class=" flex-1 flex flex-col gap-1">
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
    </aside>
  <div class="w-full flex bg-gray-100">
    <!-- Sidebar -->
    <main class="flex-1 p-0">
      <router-view />
    </main>
  </div>
  </div>

</template>

<script setup>
const menu = [
  { label: 'Dashboard', path: '/admin', icon: '🏠' },
  { label: 'Người dùng', path: '/admin/users', icon: '👤' },
  { label: 'Bài viết', path: '/admin/posts', icon: '📝' },
  { label: 'Bình luận', path: '/admin/comments', icon: '💬' },
  { label: 'Giải đấu', path: '/admin/leagues', icon: '🏆' },
  // { label: 'Lịch thi đấu', path: '/admin/matches', icon: '📅' },
  { label: 'Câu lạc bộ', path: '/admin/clubs', icon: '⚽' },
  { label: 'Cầu thủ', path: '/admin/players', icon: '🥇' },
  // { label: 'Cài đặt', path: '/admin/settings', icon: '⚙️' }
]
</script>