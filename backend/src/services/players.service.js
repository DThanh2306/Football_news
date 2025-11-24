const knex = require("../database/knex");

async function createPlayer(data) {
  const [player] = await knex("players").insert(data).returning("*");
  return player;
}

async function findBySlug(slug) {
  return knex("players").where({ player_slug: slug }).first();
}

async function addCareer(data) {
  return knex("career").insert(data);
}

async function getAllPlayers() {
  const players = await knex("players").select("*");
  for (let player of players) {
    const clubInfo = await knex("career")
      .join("clubs", "career.club_id", "clubs.club_id")
      .select("clubs.club_id", "clubs.club_name")
      .where("career.player_id", player.player_id)
      .orderBy("career.joined_at", "desc")
      .first();

    player.club = clubInfo || null;
  }
  return players;
}

async function getPlayerById(id) {
  const player = await knex("players").where({ player_id: id }).first();
  if (!player) return null;

  const clubInfo = await knex("career")
    .join("clubs", "career.club_id", "clubs.club_id")
    .select("clubs.club_id", "clubs.club_name")
    .where("career.player_id", id)
    .orderBy("career.joined_at", "desc")
    .first();

  player.club = clubInfo || null;
  return player;
}

async function getPlayersByClubId(club_id) {
  const players = await knex("career")
    .join("players", "career.player_id", "players.player_id")
    .leftJoin("clubs", "career.club_id", "clubs.club_id")
    .select(
      "players.*",
      "clubs.club_id as club_id",
      "clubs.club_name as club_name",
      "clubs.club_img as club_img",
      "career.joined_at"
    )
    .where("career.club_id", club_id)
    .orderBy("career.joined_at", "desc");

  return players.map((p) => ({
    ...p,
    club: {
      club_id: p.club_id,
      club_name: p.club_name,
      club_img: p.club_img,
    },
  }));
}

async function updatePlayer(id, updateData) {
  return knex("players").where({ player_id: id }).update(updateData);
}

async function deletePlayer(id) {
  return knex("players").where({ player_id: id }).del();
}


module.exports = {
  createPlayer,
  findBySlug,
  addCareer,
  getAllPlayers,
  getPlayerById,
  getPlayersByClubId,
  updatePlayer,
  deletePlayer,
};
