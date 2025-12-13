const knex = require("../database/knex");
const JSend = require("../jsend");
const ApiError = require("../api-error");

function usersTable() {
  return knex("users");
}

async function registerUser(userData) {
  try {
    await usersTable().insert(userData);
    return JSend.success({ message: "User registered successfully" });
  } catch (error) {
    // Handle sequence out-of-sync for Postgres: unique violation on user_id
    if (error?.code === '23505' && /\(user_id\)/.test(error?.detail || '')) {
      try {
        const [{ max }] = await knex('users').max('user_id as max');
        const nextVal = (Number(max) || 0) + 1;
        // Attempt to fix sequence for postgres
        await knex.raw("SELECT setval(pg_get_serial_sequence('users','user_id'), ?)", [nextVal]);
        // retry once
        await usersTable().insert(userData);
        return JSend.success({ message: "User registered successfully" });
      } catch (e2) {
        console.error('Retry after sequence fix failed:', e2);
      }
    }
    console.error("Error registering user: ", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function getAllUsers() {
  const users = await knex("users").select(
    "user_id as id",
    "username",
    "email",
    "avatar",
    "phone",
	  "address ",
	  "role", 
	  "avatar",
	  "user_slug ",
	  "created_at",
	  "user_update_at",
  );

  for (const u of users) {
    const [postCount] = await knex("posts").where({ user_id: u.id }).count("*");
    const [commentCount] = await knex("comments")
      .where({ user_id: u.id })
      .count("*");

    u.postsCount = parseInt(postCount.count) || 0;
    u.commentsCount = parseInt(commentCount.count) || 0;
  }

  return users;
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
    return await knex("users").where({ user_id }).update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function updateUserByUsername(username, updateData) {
  try {
    return await knex("users").where({ username }).update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng theo username:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

module.exports = {
  registerUser,
  findByUsernameOrEmail,
  existingUser,
  updateUserInfor,
  updateUserByUsername,
  getAllUsers
};
