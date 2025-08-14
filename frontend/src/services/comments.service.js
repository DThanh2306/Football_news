import axios from '@/utils/axios'

const BASE_URL = '/comments'

export const commentsService = {
  async createComment({ post_id, cmt_content }) {
    const res = await axios.post(`${BASE_URL}`, {
      post_id,
      cmt_content,
    })
    return res.data
  },
  async getCommentByUserId(user_id) {
    const res = await axios.get(`${BASE_URL}/user/${user_id}`)
    return res.data
  },
  async getCommentsByPost(post_id) {
    const res = await axios.get(`${BASE_URL}/${post_id}`)
    return res.data
  },

  async deleteComment(cmt_id) {
    const res = await axios.delete(`${BASE_URL}/${cmt_id}`)
    return res.data
  },

  async updateComment(cmt_id, newContent) {
    const res = await axios.put(`${BASE_URL}/${cmt_id}`, {
      cmt_content: newContent,
    })
    return res.data
  },

  async getAllComments() {
    const res = await axios.get('/comments')
    return res.data
  },
}
