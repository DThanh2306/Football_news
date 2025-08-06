const knex = require("../database/knex");
const ApiError = require("../api-error");

async function addCareer(data) {
  try {
    const [career] = await knex("career").insert(data).returning("*");
    return career;
  } catch (error) {
    console.error("Lỗi khi thêm career:", error);
    throw new ApiError(500, "Không thể thêm lịch sử thi đấu");
  }
}

async function getAllCareers() {
  try {
    return await knex("career")
      .join("clubs", "career.club_id", "clubs.club_id")
      .join("players", "career.player_id", "players.player_id")
      .select(
        "career.*",
        "clubs.club_name",
        "players.player_name"
      )
      .orderBy("joined_at", "desc");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách career:", error);
    throw new ApiError(500, "Không thể lấy danh sách lịch sử thi đấu");
  }
}

async function getCareerById(id) {
  try {
    return await knex("career")
      .join("clubs", "career.club_id", "clubs.club_id")
      .join("players", "career.player_id", "players.player_id")
      .select(
        "career.*",
        "clubs.club_name",
        "players.player_name"
      )
      .where("career.player_id", id)
      .first();
  } catch (error) {
    console.error("Lỗi khi lấy career:", error);
    throw new ApiError(500, "Không thể lấy chi tiết lịch sử thi đấu");
  }
}

async function updateCareer(id, data) {
  try {
    return await knex("career").where({ id }).update(data);
  } catch (error) {
    console.error("Lỗi khi cập nhật career:", error);
    throw new ApiError(500, "Không thể cập nhật lịch sử thi đấu");
  }
}

async function deleteCareer(id) {
  try {
    return await knex("career").where({ id }).del();
  } catch (error) {
    console.error("Lỗi khi xoá career:", error);
    throw new ApiError(500, "Không thể xoá lịch sử thi đấu");
  }
}

module.exports = {
  addCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
};
