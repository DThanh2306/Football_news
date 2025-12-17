<template>
  <div class="min-h-screen py-4 px-4 bg-[rgb(var(--bg))] theme-transition">
    <div class="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] gap-8 theme-transition">
      <!-- Main column -->
      <div class="flex flex-col gap-4">
        <!-- Hero slider -->
        <section class="pt-4 px-4">
          <HeroSlider :items="sliderItems" />
        </section>

        <!-- League tabs -->
        <section class="px-2">
          <LeagueTabs />
        </section>

        <!-- Posts area -->
        <section class="flex-1 min-h-0 flex flex-col">
          <div class="flex items-center justify-between pt-2 px-4">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {{ pageTitle }}
            </h2>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div v-for="i in 6" :key="'sk-' + i" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-soft p-4 animate-pulse h-40"></div>
          </div>

          <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>

          <div v-else class="flex-1 p-4">
            <div class="space-y-6">
              <div v-if="featuredPost && page === 1" class="mb-2">
                <FeaturedPost :post="featuredPost" :default-img="defaultImg" />
              </div>
              <!-- Grid of posts -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardPost v-for="post in newPosts" :key="post.post_id" :post="post" :default-img="defaultImg" />
              </div>
              <!-- Pagination -->
              <div class="flex items-center justify-center gap-2 pt-2">
                <button @click="prevPage" :disabled="page <= 1" class="px-3 py-1.5 rounded-md border border-slate-300/70 dark:border-slate-700 disabled:opacity-50">Trước</button>
                <span class="text-sm text-slate-600 dark:text-slate-300">Trang {{ page }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="page >= totalPages" class="px-3 py-1.5 rounded-md border border-slate-300/70 dark:border-slate-700 disabled:opacity-50">Sau</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="w-full flex-shrink-0">
        <div class="sticky top-28 space-y-6 p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          <RankingPanel :league-slug="activeSlug || ''" />
          <ScoreboardPanel :league="activeSlug" />
        </div>
      </aside>
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
import CardPost from '@/components/CardPost.vue'
import LeagueTabs from '@/components/LeagueTabs.vue'
import HeroSlider from '@/components/HeroSlider.vue'

const defaultImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

const route = useRoute()
const activeSlug = computed(() => route.params.slug)

const loading = ref(false)
const error = ref('')
const newPosts = ref([])
const featuredPost = ref(null)
const page = ref(1)
const limit = 10
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit)))

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
    ? 'Latest News – ' + (leagueLabels[activeSlug.value] || activeSlug.value)
    : (route.query.q ? 'Search: ' + route.query.q : 'Latest News'),
)

// Slider items: lấy từ featured + newPosts
const sliderItems = computed(() => {
  const list = []
  if (featuredPost.value) list.push(featuredPost.value)
  if (Array.isArray(newPosts.value)) list.push(...newPosts.value)
  return list.slice(0, 5)
})

async function loadDefault() {
  loading.value = true

  // pagination mode: always show loading while fetching
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
      featuredPost.value = null
      newPosts.value = items
    }

    total.value = Number((payload && payload.total) || (page.value === 1 ? items.length : (newPosts.value.length + (featuredPost.value ? 1 : 0))))
    page.value++
  } catch (e) {
    error.value = 'Cannot load posts.'
    if (page.value === 1) newPosts.value = []
  } finally {
    loading.value = false
  }
}

async function loadByLeague(slug) {
  loading.value = true
  error.value = ''
  try {
    if (typeof postsService.getByLeagueSlug === 'function') {
      const res = await postsService.getByLeagueSlug(slug, { limit: 10 })
      const items = Array.isArray(res?.data) ? res.data : []
      featuredPost.value = items[0] || null
      newPosts.value = items.slice(1)
      total.value = items.length
      return
    }

    const payload = await postsService.getPublicPosts({ league_slug: slug, limit: 10 })
    const items = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []
    featuredPost.value = items[0] || null
    newPosts.value = items.slice(1)
    total.value = items.length
  } catch (e) {
    error.value = 'Cannot load posts by league.'
    featuredPost.value = null
    newPosts.value = []
  } finally {
    loading.value = false
  }
}



async function load() {
  page.value = 1
  newPosts.value = []
  featuredPost.value = null
  total.value = 0

  const slug = activeSlug.value
  const keyword = route.query.q

  if (keyword) {
    loading.value = true
    error.value = ''
    try {
      const payload = await postsService.getPublicPosts({ q: keyword, limit: 20 })
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : []
      featuredPost.value = items[0] || null
      newPosts.value = items.slice(1)
      total.value = items.length
    } catch (e) {
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

function canPaginateDefault() { return !activeSlug.value && !route.query.q }

async function prevPage() {
  if (page.value <= 1) return
  if (!canPaginateDefault()) return
  page.value -= 1
  await loadDefault()
}

async function nextPage() {
  if (page.value >= totalPages.value) return
  if (!canPaginateDefault()) return
  page.value += 1
  await loadDefault()
}

onMounted(() => {
  page.value = 1
  newPosts.value = []
  total.value = 0
  load()
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

onUnmounted(() => {})
</script>
