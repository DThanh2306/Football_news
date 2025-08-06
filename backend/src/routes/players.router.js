const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");
const playersController = require("../controllers/players.controller");

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Quản lý cầu thủ
 */

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Tạo cầu thủ mới
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               player_name:
 *                 type: string
 *               player_infor:
 *                 type: string
 *               player_nationality:
 *                 type: string
 *               player_date_of_birth:
 *                 type: string
 *                 format: date
 *               player_img:
 *                 type: string
 *                 format: binary
 *               club_id:
 *                 type: integer
 *               joined_at:
 *                 type: string
 *                 format: date
 *               number:
 *                 type: integer
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo cầu thủ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc thiếu
 *       403:
 *         description: Không có quyền tạo
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", verifyToken, upload.single("player_img"), playersController.createPlayer);

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Lấy danh sách tất cả cầu thủ
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", playersController.getAllPlayers);

/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Lấy chi tiết cầu thủ theo ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của cầu thủ
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", playersController.getPlayerById);

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Cập nhật cầu thủ
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         description: ID cầu thủ
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               player_name: { type: string }
 *               player_infor: { type: string }
 *               player_nationality: { type: string }
 *               player_date_of_birth: { type: string, format: date }
 *               player_img: { type: string, format: binary }
 *               club_id: { type: integer }
 *               joined_at: { type: string, format: date }
 *               left_at: { type: string, format: date }
 *               number: { type: integer }
 *               position: { type: string }
 *     responses:
 *       200: { description: Thành công }
 *       403: { description: Không có quyền }
 *       404: { description: Không tìm thấy cầu thủ }
 */
router.put("/:id",verifyToken, upload.single("player_img"), playersController.updatePlayer);
module.exports = {
  setup(app) {
    app.use("/api/players", router);
  },
};
