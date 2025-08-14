<template>
  <div class="min-h-screen bg-gray-100 py-4 px-4">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 bg-white rounded-lg">
      <!-- Main Content -->
      <div class="flex-1 flex flex-col gap-8">
        <!-- League News -->
        <section>
          <h2 class="text-2xl font-bold text-blue-700 mb-4 pt-4 pl-4">
            Tin tức về {{ leagueNameDisplay }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="post in leaguePosts"
              :key="post.post_id"
              class="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                :src="post.post_images?.[0] || defaultImg"
                alt="League News"
                class="w-full md:w-40 h-32 object-cover rounded"
              />
              <div>
                <router-link :to="`/post/${post.post_id}`">
                  <h3 class="font-semibold text-lg mb-2">
                    {{ post.post_title }}
                  </h3>
                </router-link>
                <p class="text-gray-600 text-sm line-clamp-3">
                  {{ post.post_excerpt || (post.post_content ? post.post_content.slice(0, 120) + '...' : '') }}
                </p>
                <router-link
                  :to="`/post/${post.post_id}`"
                  class="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >Xem chi tiết</router-link
                >
              </div>
            </div>
          </div>
        </section>
        <!-- ... (có thể thêm phần Tin theo chủ đề nếu muốn) -->
      </div>
      <ScoreboardPanel />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ScoreboardPanel from '@/components/ScoreboardPanel.vue'
import { postsService } from '@/services/posts.service'
import { postRelationsService } from '@/services/PostRelations.service'

const defaultImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
const leaguePosts = ref([])
const route = useRoute()

// Lấy tên giải từ URL, ví dụ: /league/premier-league
const leagueSlug = computed(() => route.params.league || route.path.split('/').pop())
const leagueNameDisplay = computed(() => {
  // Chuyển slug thành tên đẹp hơn nếu muốn
  return leagueSlug.value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
})

onMounted(async () => {
  // Lấy tất cả bài viết
  const res = await postsService.getAllPosts()
  const allPosts = Array.isArray(res?.data) ? res.data : []

  // Lọc bài viết liên quan đến league này
  const filtered = []
  for (const post of allPosts) {
    // Lấy các league liên quan đến post
    const leaguesRes = await postRelationsService.getLeaguesByPost(post.post_id)
    const leagues = Array.isArray(leaguesRes?.data) ? leaguesRes.data : []
    if (leagues.some(l => l.league_slug === leagueSlug.value || l.league_name?.toLowerCase().replace(/\s/g, '-') === leagueSlug.value)) {
      filtered.push(post)
    }
  }
  leaguePosts.value = filtered
})
</script>
