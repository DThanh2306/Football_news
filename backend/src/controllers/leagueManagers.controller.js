const ApiError = require("../api-error");
const JSend = require("../jsend");
const leagueManagersService = require("../services/leagueManagers.service");

async function getAll(req, res, next) {
  try {
    const data = await leagueManagersService.getAll();
    return res.status(200).json(JSend.success(data));
  } catch (error) {
    return next(error);
  }
}

async function assign(req, res, next) {
  const { user_id, league_id } = req.body || {};

  if (!user_id || !league_id)
    return res.status(400).json(JSend.fail("user_id or league_id is missing"));

  try {
    const result = await leagueManagersService.assign(user_id, league_id);
    return res.status(201).json(JSend.success({
      message: "League Manager assigned successfully",
      result
    }));
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await leagueManagersService.remove(id);
    if (!deleted) return res.status(404).json(JSend.fail("Record not found"));

    return res.status(200).json(JSend.success("League Manager removed successfully"));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAll,
  assign,
  remove
};
