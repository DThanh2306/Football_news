import axios from "@/utils/axios";

const BASE_URL = "/careers";

export const careersService = {

  async getAllCareers() {
    const res = await axios.get(`${BASE_URL}`);
    return res.data;
  },

  async getCareerByPlayerId(playerId) {
    const res = await axios.get(`${BASE_URL}/${playerId}`);
    return res.data;
  },

  async createCareer(data) {
    const res = await axios.post(`${BASE_URL}`, data);
    return res.data;
  },

  async updateCareer(id, data) {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async deleteCareer(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
