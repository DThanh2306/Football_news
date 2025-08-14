import axios from "@/utils/axios";

const BASE_URL = "/players";

export const playersService = {

  async getAllPlayers() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async getPlayerById(id) {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  async createPlayer(playerData) {
    const formData = new FormData();
    Object.entries(playerData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const res = await axios.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  async updatePlayer(id, updatedData) {
    const formData = new FormData();
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const res = await axios.put(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};
