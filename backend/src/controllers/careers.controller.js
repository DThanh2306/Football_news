const ApiError = require("../api-error");
const JSend = require("../jsend");
const careerService = require("../services/careers.service");

async function createCareer(req, res, next) {
  const { player_id, club_id, joined_at, left_at, number, position } = req.body || {};
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const career = await careerService.addCareer({ player_id, club_id, joined_at, left_at, number, position });
    return res.status(201).json(JSend.success({ message: "Thêm lịch sử thành công", career }));
  } catch (error) {
    return next(error);
  }
}

async function getAllCareers(req, res, next) {
  try {
    const careers = await careerService.getAllCareers();
    return res.status(200).json(JSend.success(careers));
  } catch (error) {
    return next(error);
  }
}

async function getCareerById(req, res, next) {
  const { player_id } = req.params;
  try {
    const career = await careerService.getCareerById(player_id);
    if (!career) return res.status(404).json(JSend.fail("Không tìm thấy bản ghi"));
    return res.status(200).json(JSend.success(career));
  } catch (error) {
    return next(error);
  }
}

async function updateCareer(req, res, next) {
  const { player_id } = req.params;
  const updateData = req.body || {};
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const updated = await careerService.updateCareer(player_id, updateData);
    if (!updated) return res.status(404).json(JSend.fail("Không tìm thấy bản ghi"));
    return res.status(200).json(JSend.success("Cập nhật thành công"));
  } catch (error) {
    return next(error);
  }
}

async function deleteCareer(req, res, next) {
  const { id } = req.params;
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const deleted = await careerService.deleteCareer(id);
    if (!deleted) return res.status(404).json(JSend.fail("Không tìm thấy bản ghi"));
    return res.status(200).json(JSend.success("Xoá thành công"));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
};
