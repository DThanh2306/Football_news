<template>
  <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">

    <div class="flex-1">
      <div class="bg-white rounded-2xl shadow-xl p-4 border border-blue-100">

        <h1 class="text-3xl font-bold text-blue-800 mb-4 leading-tight">
          {{ post.post_title }}
        </h1>

        <div class="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
          <span class="inline-flex items-center gap-1"> 🗓️ {{ today }} </span>
          <button class="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-slate-50" @click="copyLink">
            🔗 Copy url
          </button>
          <button class="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-slate-50" @click="share">
            📤 Share
          </button>
        </div>

        <div v-if="tags.length" class="mt-1 mb-4 flex flex-wrap gap-2">
          <span v-for="t in tags" :key="t" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            #{{ t }}
          </span>
        </div>

        <div v-if="post.post_images?.length" class="flex flex-wrap gap-4 mb-6">
          <button
            v-for="(img, idx) in post.post_images"
            :key="idx"
            @click="openLightbox(idx)"
            class="w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-10px)] rounded-xl overflow-hidden border shadow group"
          >
            <img
              :src="img.replace(/'/g, '')"
              alt="Ảnh bài viết"
              class="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        </div>
        <div
          class="prose prose-blue max-w-none text-gray-800 text-justify leading-relaxed prose-img:rounded-xl prose-img:shadow"
          v-html="post.post_content"
        ></div>

        <div class="mt-10 pt-8 border-t border-slate-200">
          <h2 class="text-lg font-semibold text-blue-800 mb-4">Comments ({{ comments.length }})</h2>

          <div v-if="currentUser" class="mb-6">
            <div class="flex items-start gap-3 mb-2">
              <img :src="currentUser.avatar || defaultAvatar" class="w-10 h-10 rounded-full object-cover border" />
              <div class="flex-1">
                <a-textarea
                  v-model:value="newComment"
                  placeholder="Enter your comment..."
                  :rows="3"
                />
              </div>
            </div>
            <div class="flex justify-end">
              <a-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                Send
              </a-button>
            </div>
          </div>

          <div v-else class="text-gray-500 italic mb-4">Login to comment.</div>

          <div v-if="comments.length === 0" class="text-gray-500 italic">Start a conversation here.</div>

          <div v-else class="space-y-6">
            <div
              v-for="c in comments"
              :key="c.cmt_id"
              class="flex items-start gap-4 bg-blue-50/50 border border-blue-100 p-4 rounded-xl shadow-sm"
            >
              <img :src="c.user_avatar || defaultAvatar" class="w-10 h-10 rounded-full object-cover border" alt="avatar" />
              <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                  <div class="text-sm font-semibold text-blue-800">{{ c.username }}</div>
                  <div class="text-xs text-gray-400">{{ formatDate(c.cmt_create_at) }}</div>
                </div>
                <p class="text-gray-700 text-sm whitespace-pre-line">{{ c.cmt_content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="w-full lg:w-80 flex-shrink-0">
      <div class="sticky top-44 bg-white rounded-2xl shadow-xl border border-blue-100 p-4">
        <h2 class="text-xl font-bold text-blue-700 mb-4">Related News</h2>
        <ul class="space-y-4">
          <li v-for="related in relatedPosts" :key="related.id" class="flex gap-3">
            <img
              :src="related.thumbnail"
              alt="thumb"
              class="w-16 h-16 object-cover rounded-xl border shadow"
            />
            <div>
              <router-link
                :to="`/post/${related.id}`"
                class="font-semibold text-black-700 hover:underline"
              >
                {{ related.title }}
              </router-link>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ related.excerpt }}</p>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postsService } from '@/services/posts.service'
import { commentsService } from '@/services/comments.service'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const auth = useAuthStore()
const currentUser = auth.user
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
const route = useRoute()
const slug = route.params.slug
const post = ref({})
const authModal = ref(null)
const comments = ref([])
const newComment = ref('')
const relatedPosts = ref([])
const today = dayjs().format('dddd, hh:mm, DD/MM/YYYY')

const tags = computed(() => Array.isArray(post.value.tag_id) ? post.value.tag_id : [])

function formatDate(dateStr) {
  return dayjs(dateStr).format('HH:mm DD/MM/YYYY')
}

async function fetchComments() {
  try {
    const res = await commentsService.getCommentsByPost(post.value.post_id)
    comments.value = res.data || []
  } catch (err) {
    console.error('Lỗi khi lấy bình luận:', err)
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  try {
    await commentsService.createComment({
      post_id: post.value.post_id,
      cmt_content: newComment.value.trim(),
    })
    newComment.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Lỗi khi gửi bình luận:', err)
  }
}

onMounted(async () => {
  try {
    const res = await postsService.getPostBySlug(slug)
    const data = res?.data || res
    if (data) {
      post.value = data
      await fetchComments()
      // Lấy related theo league từ API mới
      const relatedRes = await postsService.getRelatedPosts(post.value.post_id, { by: 'league', limit: 5 })
      const relItems = Array.isArray(relatedRes?.data) ? relatedRes.data : (Array.isArray(relatedRes) ? relatedRes : [])
      relatedPosts.value = relItems.map(p => ({
        id: p.post_slug,
        title: p.post_title,
        excerpt: p.post_content?.slice(0, 100) + '...',
        thumbnail: Array.isArray(p.post_images) ? (p.post_images[0] || 'https://via.placeholder.com/150') : 'https://via.placeholder.com/150',
      }))
    }
  } catch (err) {
    console.error('Lỗi khi tải bài viết:', err)
  }
})

</script>

<style scoped>
.prose-blue a {
  color: #2563eb;
  text-decoration: underline;
}
.prose-blue a:hover {
  color: #1d4ed8;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
