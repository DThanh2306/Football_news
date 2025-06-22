const ApiError = require("../api-error");
const userService = require("../services/users.service");
const bcrypt = require("bcrypt");
const JSend = require("../jsend");
const saltRounds = 10;

async function registerUser(req, res, next) {
    const {
        username,
        email,
        password
    } = req.body || {};
    if (!username || !email || !password ) {
        console.log("Dữ liệu nhận được từ client:", req.body);
        return res.status(400).json(JSend.fail("Thiếu thông tin username, email hoặc password"));
    }
    try {
        const hashedPassword = await bcrypt.hash (password, saltRounds);
        const userData = {
            username,
            email,
            password: hashedPassword,
            created_at: new Date()
        };
        const result = await userService.registerUser(userData);
        return res.status(201).json(JSend.success(result.message));
    } catch (error) {
        console.error("Lỗi khi đăng ký người dùng:", error.message);
        return next(new ApiError(500, "Lỗi đăng ký người dùng"));
    }
}

module.exports = {
    registerUser,
};