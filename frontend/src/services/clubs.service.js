import axios from "@/utils/axios";

const BASE_URL = "/clubs";

export const clubsService = {

  async getAllClubs(league_id = null) {
    const res = await axios.get(BASE_URL, {
      params: league_id ? { league_id } : {},
    });
    return res.data;
  },

  async getClubById(id) {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  async createClub({ club_name, club_img, league_ids }) {
    const formData = new FormData();
    formData.append("club_name", club_name);
    if (club_img) formData.append("club_img", club_img);
    if (league_ids && Array.isArray(league_ids)) {
      league_ids.forEach((id) => formData.append("league_ids[]", id));
    }

    const res = await axios.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async updateClub(id, { club_name, club_img, league_ids }) {
    const formData = new FormData();
    if (club_name) formData.append("club_name", club_name);
    if (club_img) formData.append("club_img", club_img);
    if (league_ids && Array.isArray(league_ids)) {
      league_ids.forEach((id) => formData.append("league_ids[]", id));
    }

    const res = await axios.put(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async deleteClub(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
