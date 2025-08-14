import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user:  JSON.parse(localStorage.getItem("user")) || null,
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken;
      localStorage.setItem("token", newToken);
    },
    setUser(newUser) {
      this.user = newUser;
      localStorage.setItem("user", JSON.stringify(newUser));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
