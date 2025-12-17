const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/standings.controller");

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Bảng xếp hạng theo league/season
 */

/**
 * @swagger
 * /standings:
 *   get:
 *     summary: Lấy bảng xếp hạng
 *     tags: [Standings]
 *     parameters:
 *       - in: query
 *         name: league_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: season_id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Thành công }
 */
router.get("/", ctrl.getStandings);

module.exports = {
  setup(app) {
    app.use("/api/standings", router);
  },
};
