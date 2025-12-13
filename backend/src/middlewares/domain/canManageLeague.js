const knex = require("../../database/knex");
const JSend = require("../../jsend");

module.exports = async function (req, res, next) {
  const leagueId = req.body.league_id || req.params.league_id;

  if (!leagueId) {
    return res.status(400).json(JSend.fail("league_id is required"));
  }

  const found = await knex("league_managers")
    .where({
      user_id: req.user.user_id,
      league_id: leagueId
    })
    .first();

  if (!found) {
    return res.status(403).json(JSend.fail("you cannot manage this league"));
  }

  next();
};
