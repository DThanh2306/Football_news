const slugify = require("slugify");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const playerService = require("../services/players.service");

async function createPlayer(req, res, next) {
  const {
    player_name,
    player_infor,
    player_date_of_birth,
    player_nationality,
    club_id,
    joined_at,
    number,
    position,
  } = req.body || {};
  const player_img = req.file ? `/uploads/players/${req.file.filename}` : null;

  if (req.user.role !== "admin")
    return res.status(403).json(JSend.fail("Bạn không có quyền tạo cầu thủ"));
  if (!player_name || !player_img)
    return res.status(400).json(JSend.fail("Thiếu tên hoặc ảnh cầu thủ"));

  try {
    const baseSlug = slugify(player_name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await playerService.findBySlug(slug))
      slug = `${baseSlug}-${counter++}`;

    const player = await playerService.createPlayer({
      player_name,
      player_infor,
      player_date_of_birth,
      player_nationality,
      player_img,
      player_slug: slug,
    });

    if (club_id && joined_at) {
      await playerService.addCareer({
        player_id: player.player_id,
        club_id,
        joined_at,
        number,
        position,
      });
    }

    return res
      .status(201)
      .json(
        JSend.success({
          message: "Tạo cầu thủ thành công",
          player_id: player.player_id,
        })
      );
  } catch (error) {
    console.log("lỗi", error);
    return next(new ApiError(500, "Lỗi khi tạo cầu thủ"));
  }
}

async function getAllPlayers(req, res, next) {
  try {
    const players = await playerService.getAllPlayers();
    return res.status(200).json(JSend.success(players));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách cầu thủ"));
  }
}

async function getPlayerById(req, res, next) {
  const { id } = req.params;
  try {
    const player = await playerService.getPlayerById(id);
    if (!player)
      return res.status(404).json(JSend.fail("Không tìm thấy cầu thủ"));
    return res.status(200).json(JSend.success(player));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết cầu thủ"));
  }
}

async function updatePlayer(req, res, next) {
  const { id } = req.params;
  const {
    player_name,
    player_infor,
    player_date_of_birth,
    player_nationality,
  } = req.body || {};
  const player_img = req.file
    ? `/uploads/players/${req.file.filename}`
    : undefined;

  if (req.user.role !== "admin")
    return res
      .status(403)
      .json(JSend.fail("Bạn không có quyền cập nhật cầu thủ"));

  try {
    const player = await playerService.getPlayerById(id);
    if (!player)
      return res.status(404).json(JSend.fail("Không tìm thấy cầu thủ"));

    const updateData = {};
    if (player_name) updateData.player_name = player_name;
    if (player_infor) updateData.player_infor = player_infor;
    if (player_date_of_birth)
      updateData.player_date_of_birth = player_date_of_birth;
    if (player_nationality) updateData.player_nationality = player_nationality;
    if (player_img) updateData.player_img = player_img;

    if (player_name) {
      let baseSlug = slugify(player_name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await playerService.findBySlug(slug))
        slug = `${baseSlug}-${counter++}`;
      updateData.player_slug = slug;
    }

    await playerService.updatePlayer(id, updateData);

    return res.status(200).json(JSend.success("Cập nhật cầu thủ thành công"));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật cầu thủ"));
  }
}

async function deletePlayer(req, res, next) {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json(JSend.fail("Bạn không có quyền xoá cầu thủ"));

  try {
    const player = await playerService.getPlayerById(id);
    if (!player)
      return res.status(404).json(JSend.fail("Không tìm thấy cầu thủ"));

    await playerService.deletePlayer(id);
    return res.status(200).json(JSend.success("Xoá cầu thủ thành công"));
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá cầu thủ"));
  }
}
async function getPlayersByClub(req, res, next) {
  const { id } = req.params;

  try {
    const players = await playerService.getPlayersByClubId(id);
    return res.status(200).json(JSend.success(players));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Lỗi khi lấy cầu thủ theo CLB"));
  }
}

module.exports = {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  getPlayersByClub
};
