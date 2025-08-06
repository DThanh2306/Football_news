const knex = require("../database/knex");
const ApiError = require("../api-error");

async function createSeason(data) {
  try {
    console.log("SeasonDate", data);
    const [season] = await knex("seasons").insert(data).returning("*");
    return season;
  } catch (error) {
    console.error("Lỗi khi tạo mùa giải:", error);
    throw new ApiError(500, "Không thể tạo mùa giải");
  }
}

async function getAllSeasons() {
  try {
    return await knex("seasons")
      .join("leagues", "seasons.league_id", "leagues.league_id")
      .select(
        "seasons.*",
        "leagues.league_name",
        "leagues.league_slug",
        "leagues.league_img"
      )
      .orderBy("seasons.start_date", "desc");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mùa giải:", error);
    throw new ApiError(500, "Không thể lấy danh sách mùa giải");
  }
}

async function getSeasonBySlug(slug) {
  try {
    return await knex("seasons")
      .join("leagues", "seasons.league_id", "leagues.league_id")
      .select(
        "seasons.*",
        "leagues.league_name",
        "leagues.league_slug",
        "leagues.league_img"
      )
      .where("seasons.season_slug", slug)
      .first();
  } catch (error) {
    console.error("Lỗi khi lấy mùa giải:", error);
    throw new ApiError(500, "Không thể lấy mùa giải");
  }
}

async function updateSeason(id, data) {
  try {
    return await knex("seasons").where({ season_id: id }).update(data);
  } catch (error) {
    console.error("Lỗi khi cập nhật mùa giải:", error);
    throw new ApiError(500, "Không thể cập nhật mùa giải");
  }
}

async function deleteSeason(id) {
  try {
    return await knex("seasons").where({ season_id: id }).del();
  } catch (error) {
    console.error("Lỗi khi xoá mùa giải:", error);
    throw new ApiError(500, "Không thể xoá mùa giải");
  }
}

async function getSeasonById(id) {
  try {
    return await knex("seasons").where({ season_id: id }).first();
  } catch (error) {
    console.error("Lỗi khi lấy season:", error);
    throw new ApiError(500, "Không thể lấy mùa giải");
  }
}

module.exports = {
  createSeason,
  getAllSeasons,
  getSeasonBySlug,
  updateSeason,
  deleteSeason,
  getSeasonById
};
