<template>
  <article class="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden p-3">
    <div class="flex gap-4">
      <router-link :to="`/post/${post.post_slug}`" class="flex-shrink-0 w-40 md:w-56">
        <img :src="thumb" :alt="post.post_title" class="w-40 md:w-56 h-28 md:h-36 object-cover rounded-lg" />
      </router-link>
      <div class="flex-1 min-w-0">
        <router-link :to="`/post/${post.post_slug}`" class="block">
          <h3 class="text-lg md:text-xl font-semibold text-slate-900 leading-snug mb-1">{{ post.post_title }}</h3>
        </router-link>
        <p class="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-4">{{ excerpt }}</p>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ post: { type: Object, required: true }, defaultImg: { type: String, default: 'https://via.placeholder.com/400x300' } })
const thumb = computed(() => Array.isArray(props.post.post_images) ? (props.post.post_images[0] || props.defaultImg) : props.defaultImg)
function getPlainText(html) { return (html||'').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }
const excerpt = computed(() => getPlainText(props.post.post_content).slice(0, 280))
</script>

<style scoped>
.line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
</style>
