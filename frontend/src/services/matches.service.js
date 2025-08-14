import axios from "@/utils/axios";

const BASE_URL = "/matches";

export const matchesService = {

  async getAllMatches() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async getMatchById(match_id) {
    const res = await axios.get(`${BASE_URL}/${match_id}`);
    return res.data;
  },

  async createMatch(matchData) {
    const res = await axios.post(BASE_URL, matchData);
    return res.data;
  },

  async updateMatch(match_id, updatedData) {
    const res = await axios.put(`${BASE_URL}/${match_id}`, updatedData);
    return res.data;
  },

  async deleteMatch(match_id) {
    const res = await axios.delete(`${BASE_URL}/${match_id}`);
    return res.data;
  },
};
