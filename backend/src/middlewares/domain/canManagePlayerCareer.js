const knex = require("../../database/knex");
const JSend = require("../../jsend");

module.exports = async function (req, res, next) {
  const playerId = req.body.player_id || req.params.player_id;

  if (!playerId) {
    return res.status(400).json(JSend.fail("player_id is required"));
  }

  // Tìm club của player trong bảng career (club hiện tại = joined_at mới nhất)
  const career = await knex("career")
    .where({ player_id: playerId })
    .orderBy("joined_at", "desc")
    .first();

  if (!career) {
    return res.status(400).json(JSend.fail("this player's career not found"));
  }

  // Tìm league của club
  const mapping = await knex("club_league")
    .where({ club_id: career.club_id })
    .first();

  if (!mapping) {
    return res.status(400).json(JSend.fail("This club not found in any league"));
  }

  const allowed = await knex("league_managers")
    .where({
      user_id: req.user.user_id,
      league_id: mapping.league_id
    })
    .first();

  if (!allowed) {
    return res.status(403).json(JSend.fail("You cannot manage this player's career"));
  }

  next();
};
