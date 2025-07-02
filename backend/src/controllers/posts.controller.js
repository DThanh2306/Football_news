const fs = require("fs");
const path = require("path");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const postService = require("../services/posts.service");
const slugify = require("slugify");

async function createPost(req, res, next) {
  const { post_title, post_content } = req.body || {};

  if (!post_title) {
    cleanupUploadedFiles(req.files);
    return res.status(400).json(JSend.fail("Thiếu tiêu đề bài viết"));
  }

  const slug = slugify(post_title, { lower: true, strict: true });

  try {
    await postService.transaction(async (trx) => {
      const slugExists = await postService.checkSlugExists(slug, trx);
      if (slugExists) {
        cleanupUploadedFiles(req.files);
        throw new ApiError(400, "Slug bài viết đã tồn tại");
      }

      const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

      const postData = {
        user_id: req.user.user_id,
        post_title,
        post_content: post_content || "",
        post_status: "pending",
        post_slug: slug,
        post_images: imagePaths,
        post_create_at: new Date(),
        post_update_at: new Date(),
      };

      const result = await postService.createPost(postData, trx);

      return res.status(201).json(JSend.success({
        message: "Tạo bài viết thành công, đang chờ duyệt",
        post_id: result.post_id,
      }));
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error.message);
    cleanupUploadedFiles(req.files);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(JSend.fail(error.message));
    }
    return next(new ApiError(500, "Lỗi khi tạo bài viết"));
  }
}

function cleanupUploadedFiles(files) {
  if (files && files.length > 0) {
    files.forEach((file) => {
      const filePath = path.join(file.destination, file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Lỗi khi xóa file:", err);
      });
    });
  }
}


async function getPostById(req, res, next) {
  const { post_id } = req.params;

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    return res.status(200).json(JSend.success(post));
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy chi tiết bài viết"));
  }
}

async function getAllPosts(req, res, next) {
  const { page = 1, limit = 10, ...rest } = req.query;

  try {
    const validFields = [
      "post_id",
      "user_id",
      "post_title",
      "post_content",
      "post_status",
      "post_slug",
      "post_create_at",
      "post_update_at"
    ];

    const filter = {};

    for (const key in rest) {
      if (validFields.includes(key)) {
        filter[key] = rest[key];
      }
    }

    if (req.user.role !== "admin") {
      filter.user_id = req.user.user_id;
    }

    const queryOptions = {
      filter,
      page: parseInt(page),
      limit: parseInt(limit),
      fuzzyFields: ["post_title", "post_content", "post_slug"],
    };

    const posts = await postService.getAllPosts(queryOptions);

    return res.status(200).json(JSend.success(posts));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách bài viết"));
  }
}

async function updatePost(req, res, next) {
  const { post_id } = req.params;
  const { post_title, post_content, post_slug, post_images } = req.body;

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    if (req.user.role !== "admin" && req.user.user_id !== post.user_id) {
      return res.status(403).json(JSend.fail("Bạn không có quyền cập nhật bài viết này"));
    }

    const updateData = {};

    if (post_title) updateData.post_title = post_title;
    if (post_content) updateData.post_content = post_content;
    if (post_slug) updateData.post_slug = post_slug;
    if (Array.isArray(post_images)) updateData.post_images = post_images;
    updateData.post_update_at = new Date();

    const updated = await postService.updatePost(post_id, updateData);

    if (updated === 0) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    return res.status(200).json(JSend.success("Cập nhật bài viết thành công"));
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi cập nhật bài viết"));
  }
}

async function deletePost(req, res, next) {
  const { post_id } = req.params;

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    if (req.user.role !== "admin" && req.user.user_id !== post.user_id) {
      return res.status(403).json(JSend.fail("Bạn không có quyền xoá bài viết này"));
    }

    await postService.deletePost(post_id);

    return res.status(200).json(JSend.success("Xoá bài viết thành công"));
  } catch (error) {
    console.error("Lỗi khi xoá bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi xoá bài viết"));
  }
}

async function reviewPost(req, res, next) {
  const { post_id } = req.params;
  const { action, reason } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json(JSend.fail("Bạn không có quyền duyệt bài viết"));
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json(JSend.fail("Hành động không hợp lệ"));
  }

  if (action === "reject" && !reason) {
    return res.status(400).json(JSend.fail("Vui lòng cung cấp lý do từ chối"));
  }

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    const updateData = {
      post_status: action === "approve" ? "approved" : "rejected",
      post_update_at: new Date(),
    };
    if (action === "reject") {
  updateData.reject_reason = reason;
    } else {
      updateData.reject_reason = null;
    }

    const updated = await postService.updatePost(post_id, updateData);

    if (updated === 0) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    return res.status(200).json(JSend.success(
      action === "approve" ? "Đã duyệt bài viết thành công" : "Đã từ chối bài viết thành công"
    ));
  } catch (error) {
    console.error("Lỗi khi duyệt bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi duyệt bài viết"));
  }
}

async function toggleFavorite(req, res, next) {
  const { post_id } = req.params;

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    const existed = await postService.checkFavorite(req.user.user_id, post_id);

    if (existed) {
      await postService.removeFavorite(req.user.user_id, post_id);
      return res.status(200).json(JSend.success("Đã bỏ yêu thích bài viết"));
    } else {
      await postService.addFavorite(req.user.user_id, post_id);
      return res.status(200).json(JSend.success("Đã thêm bài viết vào yêu thích"));
    }
  } catch (error) {
    console.error("Lỗi khi xử lý yêu thích bài viết:", error.message);
    return next(new ApiError(500, "Lỗi khi xử lý yêu thích bài viết"));
  }
}

async function getFavorites(req, res, next) {
  try {
    const favorites = await postService.getFavoritesByUser(req.user.user_id);
    return res.status(200).json(JSend.success(favorites));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu thích:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách yêu thích"));
  }
}


module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  reviewPost,
  toggleFavorite,
  getFavorites
};
