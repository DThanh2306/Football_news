const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const commentsController = require("../controllers/comments.controller");

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Thêm bình luận cho bài viết
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: integer
 *               cmt_content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm bình luận thành công
 *       400:
 *         description: Thiếu thông tin
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", verifyToken, commentsController.createComment);

/**
 * @swagger
 * /comments/{post_id}:
 *   get:
 *     summary: Lấy danh sách bình luận của bài viết
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/:post_id", commentsController.getCommentsByPost);

/**
 * @swagger
 * /comments/{cmt_id}:
 *   delete:
 *     summary: Xoá bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cmt_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bình luận cần xoá
 *     responses:
 *       200:
 *         description: Xoá bình luận thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/:cmt_id", verifyToken, commentsController.deleteComment);

/**
 * @swagger
 * /comments/{cmt_id}:
 *   put:
 *     summary: Cập nhật nội dung bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cmt_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bình luận cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cmt_content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật bình luận thành công
 *       400:
 *         description: Thiếu nội dung
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/:cmt_id", verifyToken, commentsController.updateComment);
router.get("/user/:user_id", commentsController.getCommentByUserId);
router.get("/", commentsController.getAllComments);
module.exports = {
  setup(app) {
    app.use("/api/comments", router);
  },
};
