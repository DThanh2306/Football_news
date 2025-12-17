import axios from '@/utils/axios'

const BASE_URL = '/posts'

export const postsService = {
  async createPost({ post_title, post_content, images }) {
    const formData = new FormData()
    formData.append('post_title', post_title)
    formData.append('post_content', post_content)
    if (images && Array.isArray(images)) {
      images.forEach((img) => {
        formData.append('images', img)
      })
    }

    const res = await axios.post(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data
  },

  async getPublicPosts(filters = {}) {
    const res = await axios.get(`${BASE_URL}/public`, { params: filters })
    return res.data?.data ?? res.data
  },

  async getAllPosts(filters = {}) {
    const res = await axios.get(BASE_URL, { params: filters })
    const payload = res.data?.data ?? res.data
    return payload
  },

  async getPostById(post_id) {
    const res = await axios.get(`${BASE_URL}/${post_id}`)
    return res.data
  },

  async getPostBySlug(slug) {
    const res = await axios.get(`${BASE_URL}/slug/${encodeURIComponent(slug)}`)
    return res.data
  },

  async getRelatedPosts(post_id, { by = 'league', limit = 5 } = {}) {
    const res = await axios.get(`${BASE_URL}/${post_id}/related`, { params: { by, limit } })
    return res.data
  },

  async updatePost(post_id, { post_title, post_content, post_slug, post_images, tag_id }) {
    const res = await axios.put(`${BASE_URL}/${post_id}`, {
      post_title,
      post_content,
      post_slug,
      post_images,
      tag_id,
    })
    return res.data
  },

  async deletePost(post_id) {
    const res = await axios.delete(`${BASE_URL}/${post_id}`)
    return res.data
  },

  async reviewPost(post_id, { action, reason }) {
    const res = await axios.put(`${BASE_URL}/${post_id}/review`, {
      action,
      reason,
    })
    return res.data
  },

  async toggleFavorite(post_id) {
    const res = await axios.post(`${BASE_URL}/${post_id}/favorite`)
    return res.data
  },

  async getFavorites() {
    const res = await axios.get(`${BASE_URL}/favorites`)
    return res.data
  },
  async getPostTags(post_id) {
    const res = await axios.get(`${BASE_URL}/${post_id}/tags`)
    return res.data
  },
  async getPostByUserId(user_id, params = {}) {
    const res = await axios.get(`${BASE_URL}/user/${user_id}`, { params })
    return res.data
  },
}
