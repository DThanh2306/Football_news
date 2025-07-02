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
      .select("*")
      .where({ post_id: postId })
      .orderBy("cmt_create_at", "asc");
  } catch (error) {
    console.error("Lỗi khi truy vấn bình luận:", error);
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

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentById,
  deleteComment,
  updateComment
};
