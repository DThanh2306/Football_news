const matchService = require("../services/matches.service");
const JSend = require("../jsend");
const ApiError = require("../api-error");

async function getAllMatches(req, res, next) {
  try {
    const matches = await matchService.getAllMatches();
    return res.status(200).json(JSend.success(matches));
  } catch (error) {
    return next(error);
  }
}

async function getMatchById(req, res, next) {
  try {
    const match = await matchService.getMatchById(req.params.match_id);
    if (!match) return res.status(404).json(JSend.fail("Không tìm thấy trận đấu"));
    return res.status(200).json(JSend.success(match));
  } catch (error) {
    return next(error);
  }
}

async function createMatch(req, res, next) {
  try {
    const match = await matchService.createMatch(req.body);
    return res.status(201).json(JSend.success(match));
  } catch (error) {
    return next(error);
  }
}

async function updateMatch(req, res, next) {
  try {
    const updated = await matchService.updateMatch(req.params.match_id, req.body);
    if (!updated) return res.status(404).json(JSend.fail("Không tìm thấy trận đấu"));
    return res.status(200).json(JSend.success("Cập nhật trận đấu thành công"));
  } catch (error) {
    return next(error);
  }
}

async function deleteMatch(req, res, next) {
  try {
    const deleted = await matchService.deleteMatch(req.params.match_id);
    if (!deleted) return res.status(404).json(JSend.fail("Không tìm thấy trận đấu"));
    return res.status(200).json(JSend.success("Xoá trận đấu thành công"));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
};
