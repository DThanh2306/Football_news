<template>
  <article class="bg-white rounded-2xl shadow overflow-hidden">
    <router-link :to="`/post/${post.post_slug}`" class="block">
      <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
          {{ post.post_title }}
        </h2>
      <img :src="hero" :alt="post.post_title" class="w-full h-64 md:h-96 object-cover" />
    </router-link>
    <div class="p-5">
      <router-link :to="`/post/${post.post_slug}`">
      </router-link>
      <p class="text-slate-700 text-base md:text-lg leading-relaxed line-clamp-4">
        {{ excerpt }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  post: { type: Object, required: true },
  defaultImg: { type: String, default: 'https://via.placeholder.com/1200x600' },
})
const hero = computed(() => Array.isArray(props.post.post_images) ? (props.post.post_images[0] || props.defaultImg) : props.defaultImg)
function getPlainText(html) { return (html||'').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }
const excerpt = computed(() => getPlainText(props.post.post_content).slice(0, 300))
</script>

<style scoped>
.line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
</style>
