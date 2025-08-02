const slugify = require("slugify");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const leagueService = require("../services/leagues.service");

async function createLeague(req, res, next) {
  const { league_name, league_img } = req.body || {};

  if (req.user.role !== "admin") {
    return res.status(403).json(JSend.fail("Bạn không có quyền tạo giải đấu"));
  }

  if (!league_name || !league_img) {
    return res.status(400).json(JSend.fail("Thiếu tên hoặc ảnh giải đấu"));
  }

  const baseSlug = slugify(league_name, { lower: true, strict: true });

  try {
    await leagueService.transaction(async (trx) => {
      let slug = baseSlug;
      let counter = 1;

      while (await leagueService.findBySlug(slug, trx)) {
        slug = `${baseSlug}-${counter++}`;
      }

      const leagueData = {
        league_name,
        league_img,
        league_slug: slug,
      };

      const result = await leagueService.createLeague(leagueData, trx);

      return res.status(201).json(
        JSend.success({
          message: "Tạo giải đấu thành công",
          league_id: result.league_id,
        })
      );
    });
  } catch (error) {
    console.error("Lỗi khi tạo giải đấu:", error.message);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(JSend.fail(error.message));
    }
    return next(new ApiError(500, "Lỗi khi tạo giải đấu"));
  }
}

async function getAllLeagues(req, res, next) {
  try {
    const leagues = await leagueService.getAllLeagues();
    return res.status(200).json(JSend.success(leagues));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giải đấu:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách giải đấu"));
  }
}

async function getLeagueWithDetails(req, res, next) {
  const { id } = req.params;

  try {
    const league = await leagueService.getLeagueWithDetails(id);

    if (!league) {
      return res.status(404).json(JSend.fail("Không tìm thấy giải đấu"));
    }

    return res.status(200).json(JSend.success(league));
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết giải đấu:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy chi tiết giải đấu"));
  }
}

async function updateLeague(req, res, next) {
  const { id } = req.params;
  const { league_name, league_img } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json(JSend.fail("Bạn không có quyền cập nhật giải đấu"));
  }

  if (!league_name && !league_img) {
    return res.status(400).json(JSend.fail("Không có dữ liệu để cập nhật"));
  }

  try {
    const league = await leagueService.getLeagueWithDetails(id);

    if (!league) {
      return res.status(404).json(JSend.fail("Không tìm thấy giải đấu"));
    }

    let updateData = {};

    if (league_name) {
      updateData.league_name = league_name;

      // Tạo lại slug từ tên mới
      let baseSlug = slugify(league_name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await leagueService.findBySlug(slug)) {
        if (slug === league.league_slug) break; // slug trùng chính nó thì bỏ qua
        slug = `${baseSlug}-${counter++}`;
      }
      updateData.league_slug = slug;
    }

    if (league_img) {
      updateData.league_img = league_img;
    }

    const updated = await leagueService.updateLeague(id, updateData);

    if (updated === 0) {
      return res.status(400).json(JSend.fail("Không thể cập nhật giải đấu"));
    }

    return res.status(200).json(JSend.success("Cập nhật giải đấu thành công"));
  } catch (error) {
    console.error("Lỗi khi cập nhật giải đấu:", error.message);
    return next(new ApiError(500, "Lỗi khi cập nhật giải đấu"));
  }
}

async function deleteLeague(req, res, next) {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json(JSend.fail("Bạn không có quyền xoá giải đấu"));
  }

  try {
    const league = await leagueService.getLeagueWithDetails(id);
    if (!league) {
      return res.status(404).json(JSend.fail("Không tìm thấy giải đấu"));
    }

    await leagueService.deleteLeague(id);

    return res.status(200).json(JSend.success("Xoá giải đấu thành công"));
  } catch (error) {
    console.error("Lỗi khi xoá giải đấu:", error.message);
    return next(new ApiError(500, "Lỗi khi xoá giải đấu"));
  }
}




module.exports = {
  createLeague,
  getAllLeagues,
  getLeagueWithDetails,
  updateLeague,
  deleteLeague
};
