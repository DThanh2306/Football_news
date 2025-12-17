<template>
  <article class="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col md:flex-row gap-4 p-4">
    <router-link :to="`/post/${post.post_slug}`" class="block">
      <img :src="thumbnail" :alt="post.post_title" class="w-full md:w-44 h-36 object-cover rounded-lg" />
    </router-link>
    <div class="flex-1 min-w-0">
      <router-link :to="`/post/${post.post_slug}`">
        <h3 class="font-bold text-lg text-slate-800 line-clamp-2">{{ post.post_title }}</h3>
      </router-link>
      <p class="text-slate-600 text-sm mt-1 line-clamp-3">{{ excerpt }}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="t in tags" :key="t" class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200">#{{ t }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  defaultImg: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
})

const thumbnail = computed(() => Array.isArray(props.post.post_images) ? (props.post.post_images[0] || props.defaultImg) : props.defaultImg)

function getPlainText(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const excerpt = computed(() => getPlainText(props.post.post_content).slice(0, 160))
const tags = computed(() => Array.isArray(props.post.tag_id) ? props.post.tag_id.slice(0, 3) : [])
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
