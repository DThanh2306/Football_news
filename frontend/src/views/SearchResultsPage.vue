<template>
  <div class="min-h-screen py-4 px-4 bg-[rgb(var(--bg))] theme-transition">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between pt-2 px-2">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ pageTitle }}</h2>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
        <div v-for="i in 6" :key="i" class="h-40 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl animate-pulse"></div>
      </div>

      <div v-else-if="error" class="p-2 text-red-600">{{ error }}</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        <CardPost v-for="post in newPosts" :key="post.post_id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postsService } from '@/services/posts.service'
import CardPost from '@/components/CardPost.vue'

const route = useRoute()
const keyword = computed(() => route.query.q)

const loading = ref(false)
const error = ref('')
const newPosts = ref([])

const pageTitle = computed(() => keyword.value ? 'Kết quả tìm kiếm: "' + keyword.value + '"' : 'Tìm kiếm bài viết')

function normalizeItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload)) return payload
  return []
}

async function loadSearchResults() {
  loading.value = true
  error.value = ''
  try {
    const payload = await postsService.getPublicPosts({ q: keyword.value, limit: 30 })
    newPosts.value = normalizeItems(payload)
  } catch (e) {
    error.value = e?.message || 'Không tìm thấy kết quả phù hợp.'
    newPosts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadSearchResults)
watch(() => route.query.q, loadSearchResults)
</script>
