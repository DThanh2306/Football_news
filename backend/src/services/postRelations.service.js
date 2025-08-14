const knex = require("../database/knex");
const ApiError = require("../api-error");

async function addPostPlayer(post_id, player_id) {
  try {
    return await knex("post_player").insert({ post_id, player_id });
  } catch (error) {
    throw new ApiError(500, "Lỗi khi thêm player vào bài viết", error);
  }
}

async function removePostPlayer(post_id, player_id) {
  try {
    return await knex("post_player").where({ post_id, player_id }).del();
  } catch (error) {
    throw new ApiError(500, "Lỗi khi xoá player khỏi bài viết", error);
  }
}

async function getPlayersByPost(post_id) {
  try {
    return await knex("post_player")
      .join("players", "post_player.player_id", "players.player_id")
      .where("post_player.post_id", post_id)
      .select("players.*");
  } catch (error) {
    throw new ApiError(500, "Lỗi khi lấy cầu thủ trong bài viết", error);
  }
}

async function addPostClub(post_id, club_id) {
  return knex("post_club").insert({ post_id, club_id });
}

async function removePostClub(post_id, club_id) {
  return knex("post_club").where({ post_id, club_id }).del();
}

async function getClubsByPost(post_id) {
  return knex("post_club")
    .join("clubs", "post_club.club_id", "clubs.club_id")
    .where("post_club.post_id", post_id)
    .select("clubs.*");
}

async function addPostLeague(post_id, league_id) {
  return knex("post_league").insert({ post_id, league_id });
}

async function removePostLeague(post_id, league_id) {
  return knex("post_league").where({ post_id, league_id }).del();
}

async function getLeaguesByPost(post_id) {
  return knex("post_league")
    .join("leagues", "post_league.league_id", "leagues.league_id")
    .where("post_league.post_id", post_id)
    .select("leagues.*");
}

async function getAllByPost(post_id) {
  const players = await getPlayersByPost(post_id);
  const clubs = await getClubsByPost(post_id);
  const leagues = await getLeaguesByPost(post_id);
  
  return {
    players,
    clubs,
    leagues
  };
  
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
