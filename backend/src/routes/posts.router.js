const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const upload = require("../middlewares/upload.middleware");
const postsController = require("../controllers/posts.controller");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Quản lý bài viết
 */
router.get("/public", postsController.getPublicPosts);
/**
 * @swagger
 * /posts/{post_id}/favorite:
 *   post:
 *     summary: Thêm hoặc bỏ yêu thích bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài viết cần thêm/bỏ yêu thích
 *     responses:
 *       200:
 *         description: Thao tác thành công
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/:post_id/favorite", verifyToken, postsController.toggleFavorite);

/**
 * @swagger
 * /posts/favorites:
 *   get:
 *     summary: Lấy danh sách bài viết đã yêu thích của người dùng
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài viết đã yêu thích
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/favorites", verifyToken, postsController.getFavorites);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Tạo bài viết mới kèm ảnh
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               post_title:
 *                 type: string
 *               post_content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Danh sách file ảnh (nếu có)
 *     responses:
 *       201:
 *         description: Tạo bài viết thành công
 *       400:
 *         description: Thiếu thông tin hoặc slug đã tồn tại
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi máy chủ
 */
router.post(
  "/",
  verifyToken,
  authorize("posts", "create"),
  upload.array("images", 10),
  postsController.createPost
);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Admin - Lấy danh sách tất cả bài viết (hỗ trợ lọc theo tất cả trường)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: post_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID bài viết
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID người đăng bài
 *       - in: query
 *         name: post_title
 *         schema:
 *           type: string
 *         description: Lọc theo tiêu đề bài viết
 *       - in: query
 *         name: post_content
 *         schema:
 *           type: string
 *         description: Lọc theo nội dung bài viết
 *       - in: query
 *         name: post_status
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái bài viết (pending, approved, rejected, draft)
 *       - in: query
 *         name: post_slug
 *         schema:
 *           type: string
 *         description: Lọc theo slug bài viết
 *       - in: query
 *         name: post_create_at
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày tạo bài viết
 *       - in: query
 *         name: post_update_at
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày cập nhật bài viết
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang (mặc định 10)
 *     responses:
 *       200:
 *         description: Danh sách bài viết phù hợp
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", postsController.getAllPosts);

/**
 * @swagger
 * /posts/{post_id}:
 *   get:
 *     summary: Lấy chi tiết bài viết
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin chi tiết bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/:post_id", postsController.getPostById);

/**
 * @swagger
 * /posts/{post_id}:
 *   put:
 *     summary: Cập nhật bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài viết cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_title:
 *                 type: string
 *               post_content:
 *                 type: string
 *               post_slug:
 *                 type: string
 *               post_images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/:post_id", verifyToken, authorize("posts", "update"), postsController.updatePost);

/**
 * @swagger
 * /posts/{post_id}:
 *   delete:
 *     summary: Xoá bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài viết cần xoá
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/:post_id", verifyToken, authorize("posts", "delete"), postsController.deletePost);

/**
 * @swagger
 * /posts/{post_id}/review:
 *   put:
 *     summary: Admin duyệt hoặc từ chối bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài viết cần duyệt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối (chỉ yêu cầu khi action là reject)
 *     responses:
 *       200:
 *         description: Duyệt bài viết thành công
 *       400:
 *         description: Thiếu thông tin hoặc dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/:post_id/review", verifyToken, authorize("posts", "review"), postsController.reviewPost);

router.get("/user/:user_id",  postsController.getPostByUserId);

module.exports = {
  setup(app) {
    app.use("/api/posts", router);
  },
};
