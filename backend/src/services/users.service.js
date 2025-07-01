const knex = require("../database/knex");
const JSend = require("../jsend");
const ApiError = require("../api-error");

function usersTable() {
  return knex("users");
}

async function registerUser(userData) {
  try {
    await usersTable().insert(userData);
    return JSend.success({ message: "Người dùng đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng: ", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function existingUser(username, email) {
  try {
    const user = await knex("users")
      .where("username", username)
      .orWhere("email", email)
      .first();

    return user || null;
  } catch (error) {
    console.error("Lỗi khi kiểm tra tồn tại người dùng: ", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function findByUsernameOrEmail(username, email) {
  try {
    const query = knex("users");

    if (username) {
      query.where("username", username);
    }

    if (email) {
      if (username) {
        query.orWhere("email", email);
      } else {
        query.where("email", email);
      }
    }

    const users = await query;

    return users;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm người dùng: ", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}
async function updateUserInfor(user_id, updateData) {
  try {
    return await knex("users")
      .where({ user_id })
      .update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}


module.exports = {
  registerUser,
  findByUsernameOrEmail,
  existingUser,
  updateUserInfor
};
