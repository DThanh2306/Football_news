const slugify = require("slugify");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const knex = require("../database/knex");
const seasonService = require("../services/seasons.service");

async function createSeason(req, res, next) {
  const { league_id, start_date, end_date } = req.body || {};

  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));
  if (!league_id || !start_date || !end_date)
    return res.status(400).json(JSend.fail("Thiếu thông tin mùa giải"));

  try {

    const league = await knex("leagues").where({ league_id }).first();
    if (!league) return res.status(404).json(JSend.fail("Không tìm thấy giải đấu"));

    
    const year = new Date(start_date).getFullYear();
    const endYear = new Date(end_date).getFullYear();
    const leagueName = `${league.league_name} ${year}-${endYear}`;
    const slug = `${slugify(leagueName, { lower: true, strict: true })}`;
    
    const season = await seasonService.createSeason({
      league_id,
      name: leagueName,
      start_date,
      end_date,
      season_slug: slug,
      year,
    });

    return res.status(201).json(JSend.success({ message: "Tạo mùa giải thành công", season_id: season.season_id }));
  } catch (error) {
    console.log( error);
    return next(new ApiError(500, "Lỗi khi tạo mùa giải"));
  }
}

async function getAllSeasons(req, res, next) {
  try {
    const seasons = await seasonService.getAllSeasons();
    return res.status(200).json(JSend.success(seasons));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách mùa giải"));
  }
}

async function getSeasonBySlug(req, res, next) {
  const { slug } = req.params;
  try {
    const season = await seasonService.getSeasonBySlug(slug);
    if (!season) return res.status(404).json(JSend.fail("Không tìm thấy mùa giải"));
    return res.status(200).json(JSend.success(season));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết mùa giải"));
  }
}

async function updateSeason(req, res, next) {
  const { id } = req.params;
  const { league_id, start_date, end_date } = req.body || {};

  try {
    const season = await seasonService.getSeasonById(id);
    if (!season) return res.status(404).json(JSend.fail("Không tìm thấy mùa giải"));

    // Dữ liệu cập nhật
    const updateData = {};
    let leagueName = season.name;

    // Nếu có cập nhật giải đấu
    if (league_id) {
      const league = await knex("leagues").where({ league_id }).first();
      if (!league) return res.status(404).json(JSend.fail("Không tìm thấy giải đấu mới"));
      updateData.league_id = league_id;
      leagueName = league.league_name;
    } else {
      // Lấy tên giải hiện tại nếu không đổi
      const league = await knex("leagues").where({ league_id: season.league_id }).first();
      leagueName = league?.league_name || leagueName;
    }

    // Nếu có cập nhật ngày
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;

    // Nếu có đủ để tạo slug
    const finalStart = start_date || season.start_date;
    const finalEnd = end_date || season.end_date;

    if (finalStart && finalEnd) {
      const year = new Date(finalStart).getFullYear();
      const endYear = new Date(finalEnd).getFullYear();
      const fullName = `${leagueName} ${year}-${endYear}`;
      updateData.name = fullName;
      updateData.season_slug = slugify(fullName, { lower: true, strict: true });
      updateData.year = year;
    }

    const updated = await seasonService.updateSeason(id, updateData);
    if (!updated) return res.status(404).json(JSend.fail("Không tìm thấy mùa giải"));

    return res.status(200).json(JSend.success("Cập nhật mùa giải thành công"));
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi cập nhật mùa giải"));
  }
}

async function deleteSeason(req, res, next) {
  const { id } = req.params;
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const deleted = await seasonService.deleteSeason(id);
    if (!deleted) return res.status(404).json(JSend.fail("Không tìm thấy mùa giải"));
    return res.status(200).json(JSend.success("Xoá mùa giải thành công"));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá mùa giải"));
  }
}

module.exports = {
  createSeason,
  getAllSeasons,
  getSeasonBySlug,
  updateSeason,
  deleteSeason,
};
