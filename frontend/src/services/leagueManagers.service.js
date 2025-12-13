import axios from "@/utils/axios";

const BASE_URL = "/league-managers";

export const leagueManagersService = {
  async list() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },
  async assign({ user_id, league_id }) {
    const res = await axios.post(BASE_URL, { user_id, league_id });
    return res.data;
  },
  async remove(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  }
};
