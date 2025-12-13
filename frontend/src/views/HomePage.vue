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
            <div
              v-for="i in 6"
              :key="i"
              class="bg-white rounded-lg shadow p-4 animate-pulse h-40"
            ></div>
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
                <router-link
                  :to="`/post/${post.post_slug}`"
                >
                  <h3 class="font-semibold text-lg mb-2">{{ post.post_title }}</h3>
                </router-link>

                <p class="text-gray-600 text-sm line-clamp-3">{{ getPlainText(post.post_content).slice(0, 200) }}</p>
                <router-link
                  :to="`/post/${post.post_slug}`"
                  class="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >Xem chi tiết</router-link
                >
              </div>
            </div>
          </div>
        </section>
      </div>

      <ScoreboardPanel :league="activeSlug" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ScoreboardPanel from '@/components/ScoreboardPanel.vue'
import { postsService } from '@/services/posts.service'
import { postRelationsService } from '@/services/PostRelations.service'

const defaultImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const route = useRoute()
const activeSlug = computed(() => route.params.slug)

const loading = ref(false)
const error = ref('')
const newPosts = ref([])
const page = ref(1)
const limit = 8
const total = ref(0)
const loadingMore = ref(false)


const leagueLabels = {
  'la-liga': 'La Liga',
  'premier-league': 'Premier League',
  'serie-a': 'Serie A',
  bundesliga: 'Bundesliga',
  'ligue-1': 'Ligue 1',
  'champions-league': 'Champions League',
  'europa-league': 'Europa League',
}

const pageTitle = computed(() =>
  activeSlug.value
    ? `Tin tức – ${leagueLabels[activeSlug.value] || activeSlug.value}`
    : 'Tin tức mới nhất',
)

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function loadDefault() {
  if (page.value === 1) loading.value = true
  else loadingMore.value = true

  error.value = ''
  try {
    const res = await postsService.getPublicPosts({ page: page.value, limit })
    const data = res?.data || {}
    const items = Array.isArray(data.items) ? data.items : []

    if (page.value === 1) newPosts.value = items
    else newPosts.value.push(...items)

    total.value = Number(data.total || items.length)
    page.value++
  } catch {
    error.value = 'Không tải được bài viết.'
    if (page.value === 1) newPosts.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadByLeague(slug) {
  loading.value = true
  error.value = ''
  try {
    if (typeof postsService.getByLeagueSlug === 'function') {
      const res = await postsService.getByLeagueSlug(slug, { limit: 6 })
      newPosts.value = Array.isArray(res?.data) ? res.data : []
      loading.value = false
      return
    }

    const res = await postsService.getPublicPosts()
    const all = Array.isArray(res?.data.items) ? res.data.items : []

    const result = []
    for (const p of all) {
      if (result.length >= 6) break
      const leaguesRes = await postRelationsService.getLeaguesByPost(p.post_id)
      const leagues = Array.isArray(leaguesRes?.data) ? leaguesRes.data : []
      const match = leagues.some((l) => l.league_slug === slug || slugify(l.league_name) === slug)
      if (match) result.push(p)
    }

    newPosts.value = result
  } catch {
    error.value = 'Không tải được bài viết theo giải.'
    newPosts.value = []
  } finally {
    loading.value = false
  }
}

function onScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  const scrollHeight = document.documentElement.scrollHeight

  if (
    scrollTop + clientHeight >= scrollHeight - 300 &&
    !loadingMore.value &&
    newPosts.value.length < total.value
  ) {
    loadDefault()
  }
}

async function load() {
  page.value = 1
  newPosts.value = []
  total.value = 0

  const slug = activeSlug.value
  const keyword = route.query.q

  if (keyword) {
    loading.value = true
    error.value = ''
    try {
      const res = await postsService.getPublicPosts({ q: keyword })
      newPosts.value = Array.isArray(res?.data?.items) ? res.data.items : res.data || []
    } catch {
      error.value = 'Không tìm thấy kết quả phù hợp.'
      newPosts.value = []
    } finally {
      loading.value = false
    }
  } else if (!slug) {
    await loadDefault()
  } else {
    await loadByLeague(slug)
  }
}

onMounted(() => {
  page.value = 1
  newPosts.value = []
  total.value = 0
  load()
  window.addEventListener('scroll', onScroll)
})

watch(() => route.fullPath, () => {
  page.value = 1
  newPosts.value = []
  total.value = 0
  load()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
});

  function getPlainText(html) {
      if (!html) return "";
      return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    }

</script>
