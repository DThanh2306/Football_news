const knex = require("../database/knex");
const ApiError = require("../api-error");

function transaction(callback) {
  return knex.transaction(callback);
}

async function createTag(tagData, trx) {
  try {
    const query = trx || knex;
    const [row] = await query("tags").insert(tagData).returning(["tag_id"]);
    return row;
  } catch (error) {
    console.error("Lỗi khi tạo tag:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function checkSlugExists(tag_slug, trx) {
  try {
    const query = trx || knex;
    const existed = await query("tags").where({ tag_slug }).first();
    return !!existed;
  } catch (error) {
    console.error("Lỗi khi kiểm tra slug tag:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getTagById(tagId) {
  try {
    return await knex("tags")
      .select("tag_id", "tag_name", "tag_slug", "tag_create_at")
      .where({ tag_id: tagId })
      .first();
  } catch (error) {
    console.error("Lỗi khi truy vấn chi tiết tag:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getAllTags({ page = 1, limit = 50, search }) {
  try {
    const offset = (page - 1) * limit;
    const q = knex("tags")
      .select("tag_id", "tag_name", "tag_slug", "tag_create_at")
      .orderBy("tag_create_at", "desc")
      .limit(limit)
      .offset(offset);

    if (search) {
      q.whereILike("tag_name", `%${search}%`).orWhereILike("tag_slug", `%${search}%`);
    }

    return await q;
  } catch (error) {
    console.error("Lỗi khi truy vấn danh sách tags:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function updateTag(tagId, updateData) {
  try {
    return await knex("tags").where({ tag_id: tagId }).update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật tag:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function deleteTag(tagId) {
  try {
    return await knex("tags").where({ tag_id: tagId }).del();
  } catch (error) {
    console.error("Lỗi khi xoá tag:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

module.exports = {
  transaction,
  createTag,
  checkSlugExists,
  getTagById,
  getAllTags,
  updateTag,
  deleteTag,
};
