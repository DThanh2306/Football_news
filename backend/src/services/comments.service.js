const knex = require("../database/knex");
const ApiError = require("../api-error");

async function createComment(commentData) {
  try {
    await knex("comments").insert(commentData);
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getCommentsByPost(postId) {
  try {
    return await knex("comments")
      .join("users", "comments.user_id", "users.user_id")
      .select(
        "comments.cmt_id",
        "comments.post_id",
        "comments.user_id",
        "comments.cmt_content",
        "comments.cmt_create_at",
        "users.username",
        "users.avatar as user_avatar"
      )
      .where("comments.post_id", postId)
      .orderBy("comments.cmt_create_at", "asc");
  } catch (error) {
    throw new ApiError(500, "Lỗi khi truy vấn bình luận", error);
  }
}


async function getCommentsByUserId(user_id) {
  try {
    return await knex("comments")
      .select("*")
      .where({ user_id: user_id })
      .orderBy("cmt_create_at", "desc");
  } catch (error) {
    console.error("Lỗi khi truy vấn bình luận của người dùng:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getCommentById(cmtId) {
  try {
    return await knex("comments").where({ cmt_id: cmtId }).first();
  } catch (error) {
    console.error("Lỗi khi truy vấn bình luận:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function deleteComment(cmtId) {
  try {
    return await knex("comments").where({ cmt_id: cmtId }).del();
  } catch (error) {
    console.error("Lỗi khi xoá bình luận:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function updateComment(cmtId, content) {
  try {
    return await knex("comments")
      .where({ cmt_id: cmtId })
      .update({
        cmt_content: content,
      });
  } catch (error) {
    console.error("Lỗi khi cập nhật bình luận:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getAllCommentsWithInfo() {
  try {
    return await knex("comments")
      .join("users", "comments.user_id", "users.user_id")
      .join("posts", "comments.post_id", "posts.post_id")
      .select(
        "comments.cmt_id",
        "comments.post_id",
        "comments.user_id",
        "comments.cmt_content",
        "comments.cmt_create_at",
        "users.username",
        "users.email",
        "users.avatar as user_avatar",
        "posts.post_title"
      )
      .orderBy("comments.cmt_create_at", "desc");
  } catch (error) {
    console.error("Lỗi khi truy vấn danh sách bình luận:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}


module.exports = {
  createComment,
  getCommentsByPost,
  getCommentsByUserId,
  getCommentById,
  deleteComment,
  updateComment,
  getAllCommentsWithInfo,
};
