import axios from "@/utils/axios";

const BASE_URL = "/tags";

export const tagsService = {
  async createTag({ tag_name }) {
    const res = await axios.post(BASE_URL, { tag_name });
    return res.data; // JSend: { status, data }
  },

  async getAllTags(params = {}) {
    // params: { page, limit, tag_name, tag_slug }
    const res = await axios.get(BASE_URL, { params });
    return res.data; // { status, data: { items, total, page, limit } }
  },

  async getTagById(tag_id) {
    const res = await axios.get(`${BASE_URL}/${tag_id}`);
    return res.data;
  },

  async updateTag(tag_id, { tag_name }) {
    const res = await axios.put(`${BASE_URL}/${tag_id}`, { tag_name });
    return res.data;
  },

  async deleteTag(tag_id) {
    const res = await axios.delete(`${BASE_URL}/${tag_id}`);
    return res.data;
  },
};
