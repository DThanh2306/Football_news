import axios from "@/utils/axios";

const BASE_URL = "/leagues";

export const leaguesService = {

  async createLeague({ league_name, league_img }) {
    const res = await axios.post(BASE_URL, {
      league_name,
      league_img,
    });
    return res.data;
  },

  async getAllLeagues() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async getLeagueById(id) {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  async updateLeague(id, { league_name, league_img }) {
    const res = await axios.put(`${BASE_URL}/${id}`, {
      league_name,
      league_img,
    });
    return res.data;
  },

  async deleteLeague(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
