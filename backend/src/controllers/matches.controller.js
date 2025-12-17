const matchService = require("../services/matches.service");
const JSend = require("../jsend");
const ApiError = require("../api-error");

async function getAllMatches(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      q = '',
      league_id = null,
      season_id = null,
      status = null,
      team_id = null,
      country = null,
      date_from = null,
      date_to = null,
      sort = 'match_date',
      order = 'desc',
    } = req.query;

    const result = await matchService.searchMatches({
      page: Number(page),
      pageSize: Number(pageSize),
      q,
      league_id: league_id ? Number(league_id) : null,
      season_id: season_id ? Number(season_id) : null,
      status,
      team_id: team_id ? Number(team_id) : null,
      country,
      date_from,
      date_to,
      sort,
      order,
    });

    return res.status(200).json(JSend.success(result));
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

async function updateMatchScore(req, res, next) {
  try {
    const { match_id } = req.params;
    const { home_score, away_score, status } = req.body;

    const payload = {};
    if (home_score != null) payload.home_score = Number(home_score);
    if (away_score != null) payload.away_score = Number(away_score);
    if (status != null) payload.status = status;

    const updated = await matchService.updateMatch(match_id, payload);
    if (!updated) return res.status(404).json(JSend.fail("Không tìm thấy trận đấu"));
    return res.status(200).json(JSend.success("Cập nhật tỉ số thành công"));
  } catch (error) {
    return next(error);
  }
}

async function importMatches(req, res, next) {
  try {
    const { provider, date_from, date_to, league_external_id, league_id, country } = req.body || {};
    const result = await matchService.importMatchesFromProvider({ provider, date_from, date_to, league_external_id, league_id, country });
    return res.status(200).json(JSend.success(result));
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
  updateMatchScore,
  importMatches,
};
