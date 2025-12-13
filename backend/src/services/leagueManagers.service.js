const knex = require("../database/knex");
const ApiError = require("../api-error");

async function getAll() {
  try {
    return await knex("league_managers")
      .join("users", "users.user_id", "league_managers.user_id")
      .join("leagues", "leagues.league_id", "league_managers.league_id")
      .select(
        "league_managers.id",
        "users.user_id",
        "users.username",
        "leagues.league_id",
        "leagues.league_name",
        "league_managers.assigned_at"
      )
      .orderBy("league_managers.id", "asc");
  } catch (error) {
    throw new ApiError(500, "Lỗi truy vấn danh sách League Manager", error);
  }
}

async function assign(user_id, league_id) {
  try {
    const [exists] = await knex("league_managers")
      .where({ user_id, league_id });

    if (exists)
      throw new ApiError(400, "User này đã quản lý giải đấu này");

    const [row] = await knex("league_managers")
      .insert({ user_id, league_id })
      .returning("*");

    return row;
  } catch (error) {
    throw new ApiError(500, "Lỗi khi gán League Manager", error);
  }
}

async function remove(id) {
  try {
    return await knex("league_managers")
      .where({ id })
      .del();
  } catch (error) {
    throw new ApiError(500, "Lỗi xóa League Manager", error);
  }
}

module.exports = {
  getAll,
  assign,
  remove
};
