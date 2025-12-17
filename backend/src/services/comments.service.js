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

async function searchComments({ page = 1, pageSize = 10, q = '', post_id = null, user_id = null, from = null, to = null, sort = 'cmt_create_at', order = 'desc' }) {
  try {
    const allowedSort = new Set(['cmt_create_at', 'username', 'post_title']);
    const sortCol = allowedSort.has(sort) ? sort : 'cmt_create_at';
    const sortDir = order && order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const baseQuery = knex('comments')
      .join('users', 'comments.user_id', 'users.user_id')
      .join('posts', 'comments.post_id', 'posts.post_id')
      .select(
        'comments.cmt_id',
        'comments.post_id',
        'comments.user_id',
        'comments.cmt_content',
        'comments.cmt_create_at',
        'users.username',
        'users.email',
        'users.avatar as user_avatar',
        'posts.post_title'
      );

    if (q) {
      baseQuery.where((qb) => {
        qb.whereILike('comments.cmt_content', `%${q}%`)
          .orWhereILike('users.username', `%${q}%`)
          .orWhereILike('users.email', `%${q}%`)
          .orWhereILike('posts.post_title', `%${q}%`);
      });
    }

    if (post_id) baseQuery.andWhere('comments.post_id', post_id);
    if (user_id) baseQuery.andWhere('comments.user_id', user_id);
    if (from) baseQuery.andWhere('comments.cmt_create_at', '>=', from);
    if (to) baseQuery.andWhere('comments.cmt_create_at', '<=', to);

    const countQuery = baseQuery.clone().clearSelect().count({ count: '*' }).first();
    const { count } = await countQuery;
    const total = parseInt(count, 10) || 0;

    const items = await baseQuery
      .orderBy(sortCol, sortDir)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      items,
      pagination: { page, pageSize, total }
    };
  } catch (error) {
    console.error('Lỗi khi tìm kiếm/phân trang bình luận:', error);
    throw new ApiError(500, 'Lỗi khi truy vấn cơ sở dữ liệu', error);
  }
}

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentsByUserId,
  getCommentById,
  deleteComment,
  updateComment,
  searchComments,
};
