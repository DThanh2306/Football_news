const knex = require("../database/knex");
const JSend = require("../jsend");
const ApiError = require("../api-error");
function getAllUser() {
  return knex("users");
}

async function registerUser(userData) {
  try {
    await getAllUser().insert(userData);
    return JSend.success({ message: "Người dùng đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng: ", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

module.exports = {
  registerUser,
};
