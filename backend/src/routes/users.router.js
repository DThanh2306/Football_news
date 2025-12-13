const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const usersController = require("../controllers/users.controller");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Đăng ký người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *       400:
 *         description: Thiếu thông tin hoặc tài khoản đã tồn tại
 */
router.post("/register", usersController.registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token và thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserLoginResponse'
 *       400:
 *         description: Thiếu thông tin
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 */
router.post("/login", usersController.loginUser);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Tìm kiếm người dùng theo username hoặc email (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Username cần tìm (tùy chọn)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email cần tìm (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách người dùng tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserPublic'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get("/search", verifyToken, authorize("users", "read"), usersController.adminFindUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/JSendSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: Thiếu hoặc sai token
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get("/me", verifyToken, usersController.userGetInfor);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Không có thông tin nào để cập nhật
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/me", verifyToken, usersController.updateUserInfor);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Đổi mật khẩu hoặc reset mật khẩu người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Mật khẩu hiện tại (bắt buộc nếu tự đổi mật khẩu)
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *               targetUsername:
 *                 type: string
 *                 description: Username của người cần reset mật khẩu (chỉ admin dùng)
 *             required:
 *               - newPassword
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công hoặc reset thành công
 *       400:
 *         description: Thiếu thông tin hoặc mật khẩu mới trùng mật khẩu cũ
 *       401:
 *         description: Mật khẩu cũ không chính xác
 *       403:
 *         description: Không có quyền reset mật khẩu người khác
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
// Nếu có targetUsername => cần quyền cập nhật user khác
router.put("/change-password", verifyToken, (req, res, next) => {
  if (req.body?.targetUsername && req.body?.targetUsername !== req.user?.username) {
    return authorize("users", "update")(req, res, next);
  }
  next();
}, usersController.changePassword);
router.get("/", verifyToken, authorize("users", "read"), usersController.adminGetAllUsers);
router.put("/:username", verifyToken, authorize("users", "update"), usersController.adminUpdateUser);
// Admin create user
router.post("/", verifyToken, authorize("users", "create"), usersController.adminCreateUser);

module.exports = {
  setup(app) {
    app.use("/api/users", router);
  },
};
