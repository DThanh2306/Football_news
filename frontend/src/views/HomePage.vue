<template>
  <div class="h-[100vh] bg-gray-100 py-4 px-4 overflow-hidden">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 bg-white rounded-lg h-full">
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <section class="flex-1 min-h-0 flex flex-col">
          <div class="flex items-center justify-between pt-4 pl-4 pr-4">
            <h2 class="text-2xl font-bold text-blue-700">
              {{ pageTitle }}
            </h2>
          </div>

          <div
            v-if="loading"
            class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 h-[calc(100vh-260px)] overflow-y-auto"
          >
            <div
              v-for="i in 6"
              :key="i"
              class="bg-white rounded-lg shadow p-4 animate-pulse h-40"
            ></div>
          </div>

          <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>

          <div v-else class="flex-1 min-h-0 overflow-y-auto p-4">
            <div class="space-y-4">
              <div v-if="featuredPost" class="mb-2">
                <FeaturedPost :post="featuredPost" :default-img="defaultImg" />
              </div>
              <CardPostRow v-for="post in newPosts" :key="post.post_id" :post="post" :default-img="defaultImg" />
            </div>
          </div>
        </section>
      </div>

      <div class="w-full lg:w-80 flex-shrink-0">
        <div class=" ">

          <RankingPanel :league-slug="activeSlug || ''" />
        </div>
          <ScoreboardPanel :league="activeSlug" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ScoreboardPanel from '@/components/ScoreboardPanel.vue'
import RankingPanel from '@/components/RankingPanel.vue'
import { postsService } from '@/services/posts.service'
import FeaturedPost from '@/components/FeaturedPost.vue'
import CardPostRow from '@/components/CardPostRow.vue'

const defaultImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const route = useRoute()
const activeSlug = computed(() => route.params.slug)

const loading = ref(false)
const error = ref('')
const newPosts = ref([])
const featuredPost = ref(null)
const page = ref(1)
const limit = 8
const total = ref(0)
const loadingMore = ref(false)

const leagueLabels = {
  'la-liga': 'La Liga',
  'premier-league': 'Premier League',
  'serie-a': 'Serie A',
  'bundesliga': 'Bundesliga',
  'ligue-1': 'Ligue 1',
  'champions-league': 'Champions League',
  'europa-league': 'Europa League',
}

const pageTitle = computed(() =>
  activeSlug.value
    ? `Latest News – ${leagueLabels[activeSlug.value] || activeSlug.value}`
    : 'Latest News',
)

async function loadDefault() {
  if (page.value === 1) loading.value = true
  else loadingMore.value = true

  error.value = ''
  try {
    const payload = await postsService.getPublicPosts({ page: page.value, limit })
    const items = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []

    if (page.value === 1) {
      featuredPost.value = items[0] || null
      newPosts.value = items.slice(1)
    } else {
      newPosts.value.push(...items)
    }

    total.value = Number((payload && payload.total) || items.length)
    page.value++
  } catch {
    error.value = 'Cannot load posts.'
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

    // fallback: dùng API filter theo league_slug (tránh N+1)
    const payload = await postsService.getPublicPosts({ league_slug: slug, limit: 6 })
    const items = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []
    newPosts.value = items
  } catch {
    error.value = 'Cannot load posts by league.'
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
      const payload = await postsService.getPublicPosts({ q: keyword })
      newPosts.value = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : []
    } catch {
      error.value = 'No matching results found.'
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

watch(
  () => route.fullPath,
  () => {
    page.value = 1
    newPosts.value = []
    total.value = 0
    load()
  },
)

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

</script>
