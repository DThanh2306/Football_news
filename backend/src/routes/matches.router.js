const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const matchesController = require("../controllers/matches.controller");

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Quản lý trận đấu
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Lấy danh sách tất cả trận đấu
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Danh sách trận đấu
 */
router.get("/", matchesController.getAllMatches);

/**
 * @swagger
 * /matches/{match_id}:
 *   get:
 *     summary: Lấy chi tiết trận đấu
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin chi tiết trận đấu
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:match_id", matchesController.getMatchById);

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Tạo trận đấu mới
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [home_fc_id, away_fc_id, league_id, season_id, match_date]
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", verifyToken, matchesController.createMatch);

/**
 * @swagger
 * /matches/{match_id}:
 *   put:
 *     summary: Cập nhật trận đấu
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:match_id", verifyToken, matchesController.updateMatch);

/**
 * @swagger
 * /matches/{match_id}:
 *   delete:
 *     summary: Xoá trận đấu
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:match_id", verifyToken, matchesController.deleteMatch);

module.exports = {
  setup(app) {
    app.use("/api/matches", router);
  },
};
