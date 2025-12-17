const JSend = require("../jsend");
const ApiError = require("../api-error");
const standingsService = require("../services/standings.service");

async function getStandings(req, res, next) {
  try {
    const { league_id, season_id } = req.query || {};
    const rows = await standingsService.getStandings({ league_id: Number(league_id), season_id: season_id ? Number(season_id) : null });
    return res.status(200).json(JSend.success(rows));
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, "Cannot get standings"));
  }
}

module.exports = { getStandings };
