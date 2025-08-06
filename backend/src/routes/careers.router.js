const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const careersController = require("../controllers/careers.controller");

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Lịch sử thi đấu cầu thủ
 */

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Quản lý lịch sử thi đấu của cầu thủ
 */

/**
 * @swagger
 * /careers:
 *   post:
 *     summary: Thêm lịch sử thi đấu mới cho cầu thủ
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_id
 *               - club_id
 *               - joined_at
 *             properties:
 *               player_id:
 *                 type: integer
 *               club_id:
 *                 type: integer
 *               joined_at:
 *                 type: string
 *                 format: date
 *               left_at:
 *                 type: string
 *                 format: date
 *               number:
 *                 type: integer
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */

/**
 * @swagger
 * /careers:
 *   get:
 *     summary: Lấy danh sách toàn bộ lịch sử thi đấu
 *     tags: [Careers]
 *     responses:
 *       200:
 *         description: Danh sách lịch sử thi đấu
 */

/**
 * @swagger
 * /careers/{player_id}:
 *   get:
 *     summary: Lấy chi tiết 1 lịch sử thi đấu
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: player_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bản ghi lịch sử
 *     responses:
 *       200:
 *         description: Chi tiết lịch sử thi đấu
 *       404:
 *         description: Không tìm thấy
 */

/**
 * @swagger
 * /careers/{id}:
 *   put:
 *     summary: Cập nhật lịch sử thi đấu
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               club_id:
 *                 type: integer
 *               joined_at:
 *                 type: string
 *                 format: date
 *               left_at:
 *                 type: string
 *                 format: date
 *               number:
 *                 type: integer
 *               position:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /careers/{id}:
 *   delete:
 *     summary: Xoá lịch sử thi đấu
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy
 */

router.post("/", verifyToken, careersController.createCareer);
router.get("/", careersController.getAllCareers);
router.get("/:player_id", careersController.getCareerById);
router.put("/:id", verifyToken, careersController.updateCareer);
router.delete("/:id", verifyToken, careersController.deleteCareer);

module.exports = {
  setup(app) {
    app.use("/api/careers", router);
  },
};
