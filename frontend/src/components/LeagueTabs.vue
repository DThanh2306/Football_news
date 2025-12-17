<template>
  <div class="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-2 px-2">
    <button @click="goAll" :class="tabClass(!activeSlug)" class="px-4 py-2 rounded-full border">Mới nhất</button>
    <button v-for="l in leagues" :key="l.league_id" @click="go(l.league_slug)" :class="tabClass(activeSlug === l.league_slug)" class="px-4 py-2 rounded-full border">
      {{ l.league_name }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { leaguesService } from '@/services/leagues.service'

const route = useRoute()
const router = useRouter()
const leagues = ref([])
const activeSlug = computed(() => route.params.slug)

function tabClass(active) {
  return active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50 text-slate-700 border-blue-200'
}

function go(slug) { router.push({ name: 'homeLeague', params: { slug } }) }
function goAll() { router.push({ name: 'home' }) }

onMounted(async () => {
  try {
    const res = await leaguesService.getAllLeagues()
    leagues.value = Array.isArray(res?.data) ? res.data : res
  } catch (e) {
    leagues.value = []
  }
})
</script>
