const slugify = require("slugify");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const clubService = require("../services/clubs.service");

async function createClub(req, res, next) {
  let { club_name, league_ids = [] } = req.body || {};
  const club_img = req.file ? `/uploads/clubs/${req.file.filename}` : null;

  if (typeof league_ids === "string") {
    league_ids = [league_ids];
  }
  if (!Array.isArray(league_ids)) {
    league_ids = [];
  }
  league_ids = league_ids.map(Number);

    if (!club_name || !club_img)
    return res.status(400).json(JSend.fail("Thiếu tên hoặc ảnh CLB"));

  try {
    const baseSlug = slugify(club_name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await clubService.findBySlug(slug))
      slug = `${baseSlug}-${counter++}`;

    const club = await clubService.createClub({
      club_name,
      club_img,
      club_slug: slug,
    });

    if (Array.isArray(league_ids) && league_ids.length > 0) {
      await clubService.addClubToLeagues(club.club_id, league_ids);
    }

    return res
      .status(201)
      .json(
        JSend.success({ message: "Tạo CLB thành công", club_id: club.club_id })
      );
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo CLB"));
  }
}

async function getAllClubs(req, res, next) {
  const { league_id } = req.query;
  try {
    const clubs = await clubService.getAllClubs(league_id);
    return res.status(200).json(JSend.success(clubs));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách CLB"));
  }
}

async function getClubById(req, res, next) {
  const { id } = req.params;
  try {
    const club = await clubService.getClubById(id);
    if (!club) return res.status(404).json(JSend.fail("Không tìm thấy CLB"));
    return res.status(200).json(JSend.success(club));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết CLB"));
  }
}

async function updateClub(req, res, next) {
  const { id } = req.params;
  let { club_name, club_img, league_ids } = req.body || {};

  
  if (req.file) {
    club_img = `/uploads/clubs/${req.file.filename}`;
  }

  if (typeof league_ids === "string") {
    league_ids = [league_ids];
  }
  if (!Array.isArray(league_ids)) {
    league_ids = [];
  }
  league_ids = league_ids.map(Number);

  try {
    const club = await clubService.getClubById(id);
    if (!club) return res.status(404).json(JSend.fail("Không tìm thấy CLB"));

    const updateData = {};
    if (club_name) updateData.club_name = club_name;
    if (club_img) updateData.club_img = club_img;

    if (club_name) {
      let slug = slugify(club_name, { lower: true, strict: true });
      let counter = 1;
      while (await clubService.findBySlug(slug)) slug = `${slug}-${counter++}`;
      updateData.club_slug = slug;
    }

    await clubService.updateClub(id, updateData);

    if (Array.isArray(league_ids)) {
      await clubService.updateClubLeagues(id, league_ids);
    }

    return res.status(200).json(JSend.success("Cập nhật CLB thành công"));
  } catch (error) {
    console.error("Lỗi thực tế:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật CLB"));
  }
}

async function deleteClub(req, res, next) {
  const { id } = req.params;
    try {
    const club = await clubService.getClubById(id);
    if (!club) return res.status(404).json(JSend.fail("Không tìm thấy CLB"));
    await clubService.deleteClub(id);
    return res.status(200).json(JSend.success("Xoá CLB thành công"));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá CLB"));
  }
}

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
};
