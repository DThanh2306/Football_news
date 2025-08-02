const knex = require("../database/knex");
const ApiError = require("../api-error");

function transaction(callback) {
  return knex.transaction(callback);
}

async function createPost(postData, trx) {
  try {
    const query = trx || knex;
    const [post] = await query("posts").insert(postData).returning(["post_id"]);
    return post;
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function addImagesToPost(imageData, trx) {
  try {
    const query = trx || knex;
    await query("post_images").insert(imageData);
  } catch (error) {
    console.error("Lỗi khi thêm ảnh cho bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getPostById(postId) {
  try {
    const post = await knex("posts")
      .select(
        "post_id",
        "user_id",
        "post_title",
        "post_content",
        "post_status",
        "reject_reason",
        "post_slug",
        "post_images",
        "post_create_at",
        "post_update_at"
      )
      .where({ post_id: postId })
      .first();

    if (!post) return null;

    const { count } = await knex("favorites")
      .where({ post_id: postId })
      .count("post_id as count")
      .first();

    return {
      ...post,
      favorites_count: parseInt(count) || 0,
    };
  } catch (error) {
    console.error("Lỗi khi truy vấn chi tiết bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getAllPosts(options) {
  const { filter, page, limit, fuzzyFields = [] } = options;
  const offset = (page - 1) * limit;

  const query = knex("posts").select("*").orderBy("post_create_at", "desc");

  for (const key in filter) {
    if (fuzzyFields.includes(key)) {
      query.whereILike(key, `%${filter[key]}%`);
    } else {
      query.where(key, filter[key]);
    }
  }

  query.limit(limit).offset(offset);

  const posts = await query;
  return posts;
}

async function updatePost(postId, updateData) {
  try {
    return await knex("posts")
      .where({ post_id: postId })
      .update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function deletePost(postId) {
  try {
    return await knex("posts")
      .where({ post_id: postId })
      .del();
  } catch (error) {
    console.error("Lỗi khi xoá bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function checkFavorite(userId, postId) {
  try {
    const favorite = await knex("favorites")
      .where({ user_id: userId, post_id: postId })
      .first();
    return !!favorite;
  } catch (error) {
    console.error("Lỗi khi kiểm tra yêu thích:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function addFavorite(userId, postId) {
  try {
    await knex("favorites").insert({
      user_id: userId,
      post_id: postId,
      favorited_at: new Date(),
    });
  } catch (error) {
    console.error("Lỗi khi thêm yêu thích:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function removeFavorite(userId, postId) {
  try {
    await knex("favorites").where({ user_id: userId, post_id: postId }).del();
  } catch (error) {
    console.error("Lỗi khi bỏ yêu thích:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getFavoritesByUser(userId) {
  try {
    return await knex("favorites")
      .join("posts", "favorites.post_id", "posts.post_id")
      .select("posts.*", "favorites.favorited_at")
      .where("favorites.user_id", userId)
      .orderBy("favorites.favorited_at", "desc");
  } catch (error) {
    console.error("Lỗi khi truy vấn danh sách yêu thích:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

module.exports = {
  transaction,
  createPost,
  addImagesToPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavoritesByUser
};
