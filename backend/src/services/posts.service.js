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
        "tag_id",
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
    let tags = [];
    if (post.tag_id?.length > 0) {
      const tags = await knex("tags").whereIn("tag_id", post.tag_id);
      post.tags = tags;
    } else {
      post.tags = [];
    }
    return {
      ...post,
      favorites_count: parseInt(count) || 0,
      tags,
    };
  } catch (error) {
    console.error("Lỗi khi truy vấn chi tiết bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function getAllPosts({
  filter = {},
  page = 1,
  limit = 10,
  fuzzyFields = [],
  q = null,
}) {
  const query = knex("posts").select("*");

  if (q && fuzzyFields.length > 0) {
    query.where((builder) => {
      fuzzyFields.forEach((field, idx) => {
        if (idx === 0) {
          builder.where(field, "ilike", `%${q}%`);
        } else {
          builder.orWhere(field, "ilike", `%${q}%`);
        }
      });
    });
  }

  for (const key in filter) {
    query.andWhere(key, filter[key]);
  }

  query
    .orderBy("post_create_at", "desc")
    .limit(limit)
    .offset((page - 1) * limit);

  const [data, totalRes] = await Promise.all([
    query,
    knex("posts").count("* as count").first(),
  ]);
  return {
    items: data,
    total: Number(totalRes?.count || 0),
  };
}

async function updatePost(postId, updateData) {
  try {
    console.log("📝 Updating post:", postId, updateData);
    return await knex("posts").where({ post_id: postId }).update(updateData);
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    throw new ApiError(500, "Lỗi khi truy vấn cơ sở dữ liệu", error);
  }
}

async function deletePost(postId) {
  try {
    return await knex("posts").where({ post_id: postId }).del();
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

async function checkSlugExists(slug) {
  const existing = await knex("posts").where({ post_slug: slug }).first();
  return !!existing;
}

async function getPostsByUserId(userId) {
  try {
    return await knex("posts")
      .select("*")
      .where({ user_id: userId })
      .orderBy("post_create_at", "desc");
  } catch (error) {
    console.error("Lỗi khi truy vấn bài viết của người dùng:", error);
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
  getFavoritesByUser,
  checkSlugExists,
  getPostsByUserId,
};
