const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");

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
 *                 example: "thanh"
 *               email:
 *                 type: string
 *                 example: "ndthanh2306@gmail.com"
 *               password:
 *                 type: string
 *                 example: "thanh123"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Thiếu thông tin
 */
router.post("/register", usersController.registerUser);


module.exports = {
  setup(app) {
    app.use("/api/users", router);
  },
};