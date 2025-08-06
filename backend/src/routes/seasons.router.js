const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const seasonController = require("../controllers/seasons.controller");

/**
 * @swagger
 * tags:
 *   name: Seasons
 *   description: Quản lý mùa giải
 */

/**
 * @swagger
 * /seasons:
 *   post:
 *     summary: Tạo mùa giải mới
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - league_id
 *               - start_date
 *               - end_date
 *             properties:
 *               league_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thiếu thông tin
 *       403:
 *         description: Không có quyền
 */
router.post("/", verifyToken, seasonController.createSeason);

/**
 * @swagger
 * /seasons:
 *   get:
 *     summary: Lấy danh sách tất cả mùa giải
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", seasonController.getAllSeasons);

/**
 * @swagger
 * /seasons/{slug}:
 *   get:
 *     summary: Lấy chi tiết mùa giải theo slug
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: "Slug mùa giải (VD: champions-league-2024-2025)"
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy mùa giải
 */
router.get("/:slug", seasonController.getSeasonBySlug);

/**
 * @swagger
 * /seasons/{id}:
 *   put:
 *     summary: Cập nhật mùa giải
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của mùa giải
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               league_id:
 *                 type: integer
 *                 description: ID giải đấu mới (nếu muốn thay đổi)
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu mùa giải (yyyy-mm-dd)
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc mùa giải (yyyy-mm-dd)
 *             example:
 *               league_id: 2
 *               start_date: "2025-08-01"
 *               end_date: "2026-06-30"
 *     responses:
 *       200:
 *         description: Cập nhật mùa giải thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy mùa giải hoặc giải đấu
 *       500:
 *         description: Lỗi server
 */
router.put("/:id", verifyToken, seasonController.updateSeason);

/**
 * @swagger
 * /seasons/{id}:
 *   delete:
 *     summary: Xoá mùa giải
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID mùa giải
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy mùa giải
 */
router.delete("/:id", verifyToken, seasonController.deleteSeason);

module.exports = {
  setup(app) {
    app.use("/api/seasons", router);
  },
};
