const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const tagsController = require("../controllers/tags.controller");

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Quản lý tags
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Lấy danh sách tags
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách tags }
 *       500: { description: Lỗi máy chủ }
 */
router.get("/", tagsController.getAllTags);

/**
 * @swagger
 * /tags/{tag_id}:
 *   get:
 *     summary: Lấy chi tiết tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Thông tin tag }
 *       404: { description: Không tìm thấy tag }
 *       500: { description: Lỗi máy chủ }
 */
router.get("/:tag_id", tagsController.getTagById);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Tạo tag
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tag_name]
 *             properties:
 *               tag_name: { type: string }
 *     responses:
 *       201: { description: Tạo tag thành công }
 *       400: { description: Dữ liệu không hợp lệ }
 *       403: { description: Không có quyền }
 *       500: { description: Lỗi máy chủ }
 */
router.post("/", verifyToken, tagsController.createTag);

/**
 * @swagger
 * /tags/{tag_id}:
 *   put:
 *     summary: Cập nhật tag
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag_name: { type: string }
 *     responses:
 *       200: { description: Cập nhật tag thành công }
 *       403: { description: Không có quyền }
 *       404: { description: Không tìm thấy tag }
 *       500: { description: Lỗi máy chủ }
 */
router.put("/:tag_id", verifyToken, tagsController.updateTag);

/**
 * @swagger
 * /tags/{tag_id}:
 *   delete:
 *     summary: Xoá tag
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xoá tag thành công }
 *       403: { description: Không có quyền }
 *       404: { description: Không tìm thấy tag }
 *       500: { description: Lỗi máy chủ }
 */
router.delete("/:tag_id", verifyToken, tagsController.deleteTag);

module.exports = {
  setup(app) {
    app.use("/api/tags", router);
  },
};
