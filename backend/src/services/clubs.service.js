const knex = require("../database/knex");
const ApiError = require("../api-error");

async function findBySlug(slug) {
  return await knex("clubs").where({ club_slug: slug }).first();
}

async function createClub(data) {
  const [club] = await knex("clubs").insert(data).returning(["club_id"]);
  return club;
}

async function addClubToLeagues(club_id, league_ids) {
  const records = league_ids.map(league_id => ({ club_id, league_id }));
  await knex("club_league").insert(records);
}

async function getAllClubs(league_id) {
  if (league_id) {
    return await knex("club_league")
      .join("clubs", "club_league.club_id", "clubs.club_id")
      .where("club_league.league_id", league_id)
      .select("clubs.*");
  }

  return await knex("clubs").select("*");
}

async function getClubById(id) {
  return await knex("clubs")
    .select("club_id", "club_name", "club_img", "club_slug")
    .where({ club_id: id })
    .first();
}

async function updateClub(id, data) {
  return await knex("clubs").where({ club_id: id }).update(data);
}

async function updateClubLeagues(club_id, league_ids) {
  await knex("club_league").where({ club_id }).del();
  if (league_ids.length > 0) {
    const records = league_ids.map(league_id => ({ club_id, league_id }));
    await knex("club_league").insert(records);
  }
}

async function deleteClub(id) {
  await knex("club_league").where({ club_id: id }).del();
  return await knex("clubs").where({ club_id: id }).del();
}

module.exports = {
  findBySlug,
  createClub,
  addClubToLeagues,
  getAllClubs,
  getClubById,
  updateClub,
  updateClubLeagues,
  deleteClub
};
