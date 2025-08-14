import axios from "@/utils/axios";

const BASE_URL = "/seasons";

export const seasonsService = {

  async createSeason({ league_id, start_date, end_date }) {
    const res = await axios.post(BASE_URL, {
      league_id,
      start_date,
      end_date,
    });
    return res.data;
  },

  async getAllSeasons() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async getSeasonBySlug(slug) {
    const res = await axios.get(`${BASE_URL}/${slug}`);
    return res.data;
  },

  async updateSeason(id, { league_id, start_date, end_date }) {
    const res = await axios.put(`${BASE_URL}/${id}`, {
      league_id,
      start_date,
      end_date,
    });
    return res.data;
  },

  async deleteSeason(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
