const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const leaguesController = require("../controllers/leagues.controller");

/**
 * @swagger
 * /leagues:
 *   post:
 *     summary: Tạo giải đấu mới
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - league_name
 *               - league_img
 *             properties:
 *               league_name:
 *                 type: string
 *               league_img:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo giải đấu thành công
 *       400:
 *         description: Thiếu thông tin
 *       409:
 *         description: Slug đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", verifyToken, leaguesController.createLeague);

/**
 * @swagger
 * /leagues:
 *   get:
 *     summary: Lấy danh sách tất cả giải đấu
 *     tags: [Leagues]
 *     responses:
 *       200:
 *         description: Danh sách giải đấu
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", leaguesController.getAllLeagues);

/**
 * @swagger
 * /leagues/{id}:
 *   get:
 *     summary: Lấy chi tiết 1 giải đấu theo ID, bao gồm seasons & clubs
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của giải đấu
 *     responses:
 *       200:
 *         description: Chi tiết giải đấu
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/:id", leaguesController.getLeagueWithDetails);

/**
 * @swagger
 * /leagues/{id}:
 *   put:
 *     summary: Cập nhật giải đấu (admin)
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của giải đấu cần cập nhật
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               league_name:
 *                 type: string
 *               league_img:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 */
router.put("/:id", verifyToken, leaguesController.updateLeague);

/**
 * @swagger
 * /leagues/{id}:
 *   delete:
 *     summary: Xoá giải đấu (admin)
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID giải đấu cần xoá
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/:id", verifyToken, leaguesController.deleteLeague);

module.exports = {
  setup(app) {
    app.use("/api/leagues", router);
  },
};
