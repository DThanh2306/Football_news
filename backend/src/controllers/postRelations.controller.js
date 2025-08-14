const JSend = require("../jsend");
const ApiError = require("../api-error");
const postRelService = require("../services/postRelations.service");

// --- PLAYER
async function addPostPlayer(req, res, next) {
  const { post_id, player_id } = req.body;
  try {
    await postRelService.addPostPlayer(post_id, player_id);
    return res.status(200).json(JSend.success("Đã liên kết cầu thủ với bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function removePostPlayer(req, res, next) {
  const { post_id, player_id } = req.body;
  try {
    await postRelService.removePostPlayer(post_id, player_id);
    return res.status(200).json(JSend.success("Đã xoá cầu thủ khỏi bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function getPlayersByPost(req, res, next) {
  try {
    const players = await postRelService.getPlayersByPost(req.params.post_id);
    return res.status(200).json(JSend.success(players));
  } catch (error) {
    return next(error);
  }
}

// --- CLUB
async function addPostClub(req, res, next) {
  const { post_id, club_id } = req.body;
  try {
    await postRelService.addPostClub(post_id, club_id);
    return res.status(200).json(JSend.success("Đã liên kết CLB với bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function removePostClub(req, res, next) {
  const { post_id, club_id } = req.body;
  try {
    await postRelService.removePostClub(post_id, club_id);
    return res.status(200).json(JSend.success("Đã xoá CLB khỏi bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function getClubsByPost(req, res, next) {
  try {
    const clubs = await postRelService.getClubsByPost(req.params.post_id);
    return res.status(200).json(JSend.success(clubs));
  } catch (error) {
    return next(error);
  }
}

// --- LEAGUE
async function addPostLeague(req, res, next) {
  const { post_id, league_id } = req.body;
  try {
    await postRelService.addPostLeague(post_id, league_id);
    return res.status(200).json(JSend.success("Đã liên kết giải đấu với bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function removePostLeague(req, res, next) {
  const { post_id, league_id } = req.body;
  try {
    await postRelService.removePostLeague(post_id, league_id);
    return res.status(200).json(JSend.success("Đã xoá giải đấu khỏi bài viết"));
  } catch (error) {
    return next(error);
  }
}

async function getLeaguesByPost(req, res, next) {
  try {
    const leagues = await postRelService.getLeaguesByPost(req.params.post_id);
    return res.status(200).json(JSend.success(leagues));
  } catch (error) {
    return next(error);
  }
}

async function getAllByPost(req, res, next) {
  const { post_id } = req.params;
  try {
    const relations = await postRelService.getAllByPost(post_id);
    return res.status(200).json(JSend.success(relations));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addPostPlayer,
  removePostPlayer,
  getPlayersByPost,
  addPostClub,
  removePostClub,
  getClubsByPost,
  addPostLeague,
  removePostLeague,
  getLeaguesByPost,
  getAllByPost
};
