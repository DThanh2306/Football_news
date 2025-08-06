const knex = require("../database/knex");
const ApiError = require("../api-error");

async function getAllMatches() {
  try {
    return await knex("matches").select("*").orderBy("match_date", "desc");
  } catch (error) {
    throw new ApiError(500, "Lỗi khi truy vấn danh sách trận đấu", error);
  }
}

async function getMatchById(match_id) {
  try {
    return await knex("matches").where({ match_id }).first();
  } catch (error) {
    throw new ApiError(500, "Lỗi khi truy vấn trận đấu", error);
  }
}

async function createMatch(data) {
  try {
    const [match] = await knex("matches").insert(data).returning("*");
    return match;
  } catch (error) {
    throw new ApiError(500, "Lỗi khi tạo trận đấu", error);
  }
}

async function updateMatch(match_id, data) {
  try {
    return await knex("matches").where({ match_id }).update(data);
  } catch (error) {
    throw new ApiError(500, "Lỗi khi cập nhật trận đấu", error);
  }
}

async function deleteMatch(match_id) {
  try {
    return await knex("matches").where({ match_id }).del();
  } catch (error) {
    throw new ApiError(500, "Lỗi khi xoá trận đấu", error);
  }
}

module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
};
