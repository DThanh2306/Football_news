import axios from "@/utils/axios";

const BASE_URL = "/relations";

export const postRelationsService = {
  // ===== PLAYER =====
  async addPlayerToPost(post_id, player_id) {
    const res = await axios.post(`${BASE_URL}/player/add`, { post_id, player_id });
    return res.data;
  },

  async removePlayerFromPost(post_id, player_id) {
    const res = await axios.post(`${BASE_URL}/player/remove`, { post_id, player_id });
    return res.data;
  },

  async getPlayersByPost(post_id) {
    const res = await axios.get(`${BASE_URL}/player/${post_id}`);
    return res.data;
  },

  // ===== CLUB =====
  async addClubToPost(post_id, club_id) {
    const res = await axios.post(`${BASE_URL}/club/add`, { post_id, club_id });
    return res.data;
  },

  async removeClubFromPost(post_id, club_id) {
    const res = await axios.post(`${BASE_URL}/club/remove`, { post_id, club_id });
    return res.data;
  },

  async getClubsByPost(post_id) {
    const res = await axios.get(`${BASE_URL}/club/${post_id}`);
    return res.data;
  },

  // ===== LEAGUE =====
  async addLeagueToPost(post_id, league_id) {
    const res = await axios.post(`${BASE_URL}/league/add`, { post_id, league_id });
    return res.data;
  },

  async removeLeagueFromPost(post_id, league_id) {
    const res = await axios.post(`${BASE_URL}/league/remove`, { post_id, league_id });
    return res.data;
  },

  async getLeaguesByPost(post_id) {
    const res = await axios.get(`${BASE_URL}/league/${post_id}`);
    return res.data;
  },
  async getAllByPost(post_id) {
    const res = await axios.get(`${BASE_URL}/all/${post_id}`);
    return res.data;
  }
};
