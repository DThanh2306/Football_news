module.exports = {
  chief_editor: {
    posts: ["create", "update", "delete", "review"],
    leagues: ["create", "update", "delete"],
    clubs: ["create", "update", "delete"],
    players: ["create", "update", "delete"],
    careers: ["create", "update", "delete"],
    matches: ["create", "update", "delete"],
    tags: ["create", "update", "delete"],
    users: ["create", "update", "delete", "assign_role", "read"],
    league_managers: ["read", "assign", "remove"],
  },

  editor: {
    posts: ["create", "update", "review"],
  },

  league_manager: {
    clubs: ["update"],
    players: ["update"],
    careers: ["create", "update"],
    matches: ["update"],
  },

  user: {
    // quyền mặc định tối thiểu (nếu cần, để trống cho tối giản)
  },
};
