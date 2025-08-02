const knex = require("../database/knex");
const ApiError = require("../api-error");

function transaction(callback) {
  return knex.transaction(callback);
}

async function findBySlug(slug, trx) {
  try {
    const query = trx || knex;
    return await query("leagues").where({ league_slug: slug }).first();
  } catch (error) {
    console.error("Lỗi khi tìm slug giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function createLeague(data, trx) {
  try {
    const query = trx || knex;
    const [league] = await query("leagues")
      .insert(data)
      .returning(["league_id"]);
    return league;
  } catch (error) {
    console.error("Lỗi khi tạo giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getAllLeagues() {
  try {
    return await knex("leagues")
      .select("league_id", "league_name", "league_img", "league_slug")
      .orderBy("league_name", "asc");
  } catch (error) {
    console.error("Lỗi khi truy vấn danh sách giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getLeagueWithDetails(league_id) {
  try {
    const league = await knex("leagues")
      .select("league_id", "league_name", "league_img", "league_slug")
      .where({ league_id })
      .first();

    if (!league) return null;

    const seasons = await knex("seasons")
      .select(
        "season_id",
        "name",
        "year",
        "start_date",
        "end_date",
        "season_slug"
      )
      .where({ league_id })
      .orderBy("year", "desc");

    const clubs = await knex("club_league")
      .join("clubs", "club_league.club_id", "clubs.club_id")
      .select("clubs.club_id", "club_name", "club_img", "club_slug")
      .where("club_league.league_id", league_id)
      .orderBy("club_name", "asc");

    return {
      ...league,
      seasons,
      clubs,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function updateLeague(id, updateData) {
  try {
    return await knex("leagues").where({ league_id: id }).update(updateData);
  } catch (error) {
    console.error("Lỗi cập nhật giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function deleteLeague(id) {
  try {
    return await knex("leagues").where({ league_id: id }).del();
  } catch (error) {
    console.error("Lỗi khi xoá giải đấu:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

module.exports = {
  transaction,
  findBySlug,
  createLeague,
  getAllLeagues,
  getLeagueWithDetails,
  updateLeague,
  deleteLeague
};
