const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const controller = require("../controllers/postRelations.controller");

/**
 * @swagger
 * tags:
 *   name: PostRelations
 *   description: Gắn liên kết giữa bài viết và cầu thủ/CLB/giải đấu
 */

/**
 * @swagger
 * tags:
 *   name: PostRelations
 *   description: Gắn liên kết bài viết với cầu thủ, CLB, giải đấu
 */

/**
 * @swagger
 * /relations/player/add:
 *   post:
 *     summary: Gắn cầu thủ vào bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, player_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               player_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gắn thành công
 */

// PLAYER
router.post("/player/add", verifyToken, controller.addPostPlayer);

/**
 * @swagger
 * /relations/player/remove:
 *   post:
 *     summary: Gỡ cầu thủ khỏi bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, player_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               player_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gỡ thành công
 */
router.post("/player/remove", verifyToken, controller.removePostPlayer);

/**
 * @swagger
 * /relations/player/{post_id}:
 *   get:
 *     summary: Lấy danh sách cầu thủ trong bài viết
 *     tags: [PostRelations]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách cầu thủ
 */
router.get("/player/:post_id", controller.getPlayersByPost);

/**
 * @swagger
 * /relations/club/add:
 *   post:
 *     summary: Gắn CLB vào bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, club_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               club_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gắn thành công
 */

// CLUB
router.post("/club/add", verifyToken, controller.addPostClub);

/**
 * @swagger
 * /relations/club/remove:
 *   post:
 *     summary: Gỡ CLB khỏi bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, club_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               club_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gỡ thành công
 */
router.post("/club/remove", verifyToken, controller.removePostClub);

/**
 * @swagger
 * /relations/club/{post_id}:
 *   get:
 *     summary: Lấy danh sách CLB trong bài viết
 *     tags: [PostRelations]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách CLB
 */
router.get("/club/:post_id", controller.getClubsByPost);

/**
 * @swagger
 * /relations/league/add:
 *   post:
 *     summary: Gắn giải đấu vào bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, league_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               league_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gắn thành công
 */
// LEAGUE
router.post("/league/add", verifyToken, controller.addPostLeague);

/**
 * @swagger
 * /relations/league/remove:
 *   post:
 *     summary: Gỡ giải đấu khỏi bài viết
 *     tags: [PostRelations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id, league_id]
 *             properties:
 *               post_id:
 *                 type: integer
 *               league_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gỡ thành công
 */
router.post("/league/remove", verifyToken, controller.removePostLeague);

/**
 * @swagger
 * /relations/league/{post_id}:
 *   get:
 *     summary: Lấy danh sách giải đấu trong bài viết
 *     tags: [PostRelations]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách giải đấu
 */
router.get("/league/:post_id", controller.getLeaguesByPost);

module.exports = {
  setup(app) {
    app.use("/api/relations", router);
  },
};