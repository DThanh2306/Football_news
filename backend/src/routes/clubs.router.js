const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const clubsController = require("../controllers/clubs.controller");
const upload = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *   name: Clubs
 *   description: Quản lý câu lạc bộ
 */

/**
 * @swagger
 * /clubs:
 *   post:
 *     summary: Tạo CLB mới
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               club_name:
 *                 type: string
 *               club_img:
 *                 type: string
 *                 format: binary
 *               league_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Tạo CLB thành công
 */
router.post("/", verifyToken, upload.single("club_img"), clubsController.createClub);

/**
 * @swagger
 * /clubs:
 *   get:
 *     summary: Lấy danh sách CLB
 *     tags: [Clubs]
 *     parameters:
 *       - in: query
 *         name: league_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách CLB
 */
router.get("/", clubsController.getAllClubs);

/**
 * @swagger
 * /clubs/{id}:
 *   get:
 *     summary: Lấy chi tiết CLB
 *     tags: [Clubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết CLB
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", clubsController.getClubById);

/**
 * @swagger
 * /clubs/{id}:
 *   put:
 *     summary: Cập nhật CLB (admin)
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID CLB cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               club_name:
 *                 type: string
 *               club_img:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện mới cho CLB
 *               league_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Mảng ID các giải đấu liên kết
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy CLB
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/:id", verifyToken, upload.single("club_img"), clubsController.updateClub);

/**
 * @swagger
 * /clubs/{id}:
 *   delete:
 *     summary: Xoá CLB
 *     tags: [Clubs]
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
 */
router.delete("/:id", verifyToken, clubsController.deleteClub);

module.exports = {
  setup(app) {
    app.use("/api/clubs", router);
  },
};
