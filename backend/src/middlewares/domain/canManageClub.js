const knex = require("../../database/knex");
const JSend = require("../../jsend");

module.exports = async function (req, res, next) {
  const clubId = req.body.club_id || req.params.club_id;

  if (!clubId) {
    return res.status(400).json(JSend.fail("club_id is required"));
  }

  // Lấy league của club
  const mapping = await knex("club_league")
    .where({ club_id: clubId })
    .first();

  if (!mapping) {
    return res.status(404).json(JSend.fail("This club not found in any league"));
  }

  const allowed = await knex("league_managers")
    .where({
      user_id: req.user.user_id,
      league_id: mapping.league_id
    })
    .first();

  if (!allowed) {
    return res.status(403).json(JSend.fail("You cannot manage this club"));
  }

  next();
};
