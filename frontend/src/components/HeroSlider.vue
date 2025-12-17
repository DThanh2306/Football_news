<template>
  <div class="relative rounded-2xl overflow-hidden shadow-lg">
    <div v-if="items.length === 0" class="h-56 md:h-72 bg-gray-100 animate-pulse" />
    <div v-else class="h-56 md:h-72 relative">
      <router-link :to="active && active.post_slug ? ('/post/' + active.post_slug) : '/posts'">
        <img :src="heroImage" class="w-full h-56 md:h-72 object-cover" :alt="active?.post_title" />
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 class="text-white text-xl md:text-2xl font-bold line-clamp-2">{{ active?.post_title }}</h2>
          <p class="text-white/80 text-sm mt-1 line-clamp-2">{{ excerpt }}</p>
        </div>
      </router-link>
      <div class="absolute right-2 bottom-2 flex gap-2">
        <button v-for="(it, idx) in items" :key="it.post_id || idx" @click="go(idx)" :class="idx === current ? 'bg-white' : 'bg-white/60'" class="w-2.5 h-2.5 rounded-full"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  defaultImg: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
  intervalMs: { type: Number, default: 5000 },
})

const current = ref(0)
const timer = ref(null)

const active = computed(() => props.items[current.value] || null)
const heroImage = computed(() => Array.isArray(active.value?.post_images) ? (active.value.post_images[0] || props.defaultImg) : props.defaultImg)

function getPlainText(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const excerpt = computed(() => getPlainText(active.value?.post_content).slice(0, 140))

function start() {
  stop()
  if (props.items.length <= 1) return
  timer.value = setInterval(() => {
    current.value = (current.value + 1) % props.items.length
  }, props.intervalMs)
}
function stop() { if (timer.value) { clearInterval(timer.value); timer.value = null } }
function go(idx) { current.value = idx; start() }

watch(() => props.items, () => { current.value = 0; start() })
onMounted(start)
onUnmounted(stop)
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
