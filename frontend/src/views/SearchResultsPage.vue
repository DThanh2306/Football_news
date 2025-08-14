<template>
  <div class="min-h-screen bg-gray-100 py-4 px-4">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 bg-white rounded-lg">
      <div class="flex-1 flex flex-col gap-8">
        <section>
          <div class="flex items-center justify-between pt-4 pl-4 pr-4">
            <h2 class="text-2xl font-bold text-blue-700">
              {{ pageTitle }}
            </h2>
          </div>

          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow p-4 animate-pulse h-40"></div>
          </div>

          <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div
              v-for="post in newPosts"
              :key="post.post_id"
              class="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                :src="post.post_images?.[0] || defaultImg"
                :alt="post.post_title"
                class="w-full md:w-40 h-32 object-cover rounded"
              />
              <div>
                <router-link :to="`/post/${post.post_slug}`">
                  <h3 class="font-semibold text-lg mb-2">{{ post.post_title }}</h3>
                </router-link>
                <p class="text-gray-600 text-sm line-clamp-3">
                  {{
                    post.post_excerpt ||
                    (post.post_content ? post.post_content.slice(0, 120) + '...' : '')
                  }}
                </p>
                <router-link
                  :to="`/post/${post.post_slug}`"
                  class="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >Xem chi tiết</router-link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postsService } from '@/services/posts.service'

const route = useRoute()
const keyword = computed(() => route.query.q)

const loading = ref(false)
const error = ref('')
const newPosts = ref([])
const defaultImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const pageTitle = computed(() =>
  keyword.value ? `Kết quả tìm kiếm: "${keyword.value}"` : 'Tìm kiếm bài viết'
)

async function loadSearchResults() {
  loading.value = true
  error.value = ''
  try {
    const res = await postsService.getAllPosts({ q: keyword.value })
    const raw = res?.data || {}
    newPosts.value = Array.isArray(raw.items) ? raw.items : []
  } catch {
    error.value = 'Không tìm thấy kết quả phù hợp.'
    newPosts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadSearchResults)
watch(() => route.query.q, loadSearchResults)
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
