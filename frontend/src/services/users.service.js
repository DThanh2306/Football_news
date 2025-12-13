import axios from "@/utils/axios";

const BASE_URL = "/users";

export const usersService = {
  
  async register({ username, email, password }) {
    const res = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
    });
    return res.data;
  },

  async login({ username, password }) {
    const res = await axios.post(`${BASE_URL}/login`, {
      username,
      password,
    });
    console.log("Login response:", res.data.data);
    return res.data.data;
  },
  async getAll() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },
  async getMe() {
    const res = await axios.get(`${BASE_URL}/me`);
    return res.data;
  },

  async updateMe(updateData) {
    const res = await axios.put(`${BASE_URL}/me`, updateData);
    return res.data;
  },

  async changePassword({ oldPassword, newPassword, targetUsername }) {
    const res = await axios.put(`${BASE_URL}/change-password`, {
      oldPassword,
      newPassword,
      targetUsername,
    });
    return res.data;
  },

  async searchUsers({ username, email }) {
    const res = await axios.get(`${BASE_URL}/search`, {
      params: { username, email },
    });
    return res.data;
  },

  async adminUpdateUser(username, updateData) {
    const res = await axios.put(`${BASE_URL}/${encodeURIComponent(username)}`, updateData);
    return res.data;
  },

  async adminCreateUser(payload) {
    const res = await axios.post(`${BASE_URL}`, payload);
    return res.data;
  },

  async assignLeagueManager({ user_id, league_id }) {
    const res = await axios.post(`/league-managers`, { user_id, league_id });
    return res.data;
  },
  async removeLeagueManager(id) {
    const res = await axios.delete(`/league-managers/${id}`);
    return res.data;
  },
};
