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
    console.error("Error creating post:", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function addImagesToPost(imageData, trx) {
  try {
    const query = trx || knex;
    await query("post_images").insert(imageData);
  } catch (error) {
    console.error("Error adding images to post:", error);
    throw new ApiError(500, "Database query error", error);
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
      tags = await knex("tags").whereIn("tag_id", post.tag_id);
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
    console.error("Error fetching post detail:", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function getAllPosts({
  filter = {},
  page = 1,
  limit = 10,
  offset = undefined,
  fuzzyFields = [],
  q = null,
}) {
  const query = knex({ p: "posts" })
    .leftJoin({ u: "users" }, "p.user_id", "u.user_id")
    .select("p.*", "u.username", "u.email", "u.avatar");

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

  // pagination
  const effOffset = typeof offset === 'number' ? offset : (Math.max(1, Number(page)) - 1) * Number(limit);
  query.orderBy("post_create_at", "desc").limit(Number(limit)).offset(effOffset);

  // total count with same filters
  const countQuery = knex({ p: "posts" });
  if (q && fuzzyFields.length > 0) {
    countQuery.where((builder) => {
      fuzzyFields.forEach((field, idx) => {
        if (idx === 0) builder.where(field, "ilike", `%${q}%`);
        else builder.orWhere(field, "ilike", `%${q}%`);
      });
    });
  }
  for (const key in filter) {
    countQuery.andWhere(key, filter[key]);
  }

  const [data, totalRes] = await Promise.all([
    query,
    countQuery.count("* as count").first(),
  ]);
  return {
    items: data,
    total: Number(totalRes?.count || 0),
  };
}

async function getPublicPosts({
  filter = {},
  page = 1,
  limit = 10,
  offset = undefined,
  fuzzyFields = [],
  q = null,
}) {
  const query = knex({ p: "posts" })
    .leftJoin({ u: "users" }, "p.user_id", "u.user_id")
    .select("p.*", "u.username", "u.email", "u.avatar")
    .where("p.post_status", "published");

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

  // pagination
  const effOffset = typeof offset === 'number' ? offset : (Math.max(1, Number(page)) - 1) * Number(limit);
  query.orderBy("post_create_at", "desc").limit(Number(limit)).offset(effOffset);

  // total count with same filters
  const countQuery = knex({ p: "posts" }).where("p.post_status", "published");
  if (q && fuzzyFields.length > 0) {
    countQuery.where((builder) => {
      fuzzyFields.forEach((field, idx) => {
        if (idx === 0) builder.where(field, "ilike", `%${q}%`);
        else builder.orWhere(field, "ilike", `%${q}%`);
      });
    });
  }
  for (const key in filter) {
    countQuery.andWhere(key, filter[key]);
  }

  const [data, totalRes] = await Promise.all([
    query,
    countQuery.count("* as count").first(),
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
    console.error("Error updating post:", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function deletePost(postId) {
  try {
    return await knex("posts").where({ post_id: postId }).del();
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function checkFavorite(userId, postId) {
  try {
    const favorite = await knex("favorites")
      .where({ user_id: userId, post_id: postId })
      .first();
    return !!favorite;
  } catch (error) {
    console.error("Error checking favorite:", error);
    throw new ApiError(500, "Database query error", error);
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
    console.error("Error adding favorite:", error);
    throw new ApiError(500, "Database query error", error);
  }
}

async function removeFavorite(userId, postId) {
  try {
    await knex("favorites").where({ user_id: userId, post_id: postId }).del();
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw new ApiError(500, "Database query error", error);
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
    console.error("Error fetching favorites list:", error);
    throw new ApiError(500, "Database query error", error);
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
    console.error("Error fetching user's posts:", error);
    throw new ApiError(500, "Database query error", error);
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
  getPublicPosts,
};
