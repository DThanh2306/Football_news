const JSend = require("../jsend");
const ApiError = require("../api-error");
const commentService = require("../services/comments.service");
const postService = require("../services/posts.service");

async function createComment(req, res, next) {
  const { post_id, cmt_content } = req.body;

  if (!post_id || !cmt_content) {
    return res.status(400).json(JSend.fail("Thiếu thông tin bài viết hoặc nội dung bình luận"));
  }

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    const commentData = {
      post_id,
      user_id: req.user.user_id,
      cmt_content,
      cmt_create_at: new Date(),
    };

    await commentService.createComment(commentData);

    return res.status(201).json(JSend.success("Thêm bình luận thành công"));
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error.message);
    return next(new ApiError(500, "Lỗi khi thêm bình luận"));
  }
}

async function getCommentsByPost(req, res, next) {
  const { post_id } = req.params;

  try {
    const post = await postService.getPostById(post_id);

    if (!post) {
      return res.status(404).json(JSend.fail("Không tìm thấy bài viết"));
    }

    const comments = await commentService.getCommentsByPost(post_id);
    console.log("Comments:", comments);
    return res.status(200).json(JSend.success(comments));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bình luận:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách bình luận"));
  }
}

async function getCommentByUserId(req, res, next) {
  const { user_id } = req.params;

  try {
    const comments = await commentService.getCommentsByUserId(user_id);

    if (!comments || comments.length === 0) {
      return res.status(404).json(JSend.fail("Không tìm thấy bình luận của người dùng này"));
    }

    return res.status(200).json(JSend.success(comments));
  } catch (error) {
    console.error("Lỗi khi lấy bình luận của người dùng:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy bình luận của người dùng"));
  }
}

async function deleteComment(req, res, next) {
  const { cmt_id } = req.params;

  try {
    const comment = await commentService.getCommentById(cmt_id);

    if (!comment) {
      return res.status(404).json(JSend.fail("Không tìm thấy bình luận"));
    }

    
    await commentService.deleteComment(cmt_id);

    return res.status(200).json(JSend.success("Xoá bình luận thành công"));
  } catch (error) {
    console.error("Lỗi khi xoá bình luận:", error.message);
    return next(new ApiError(500, "Lỗi khi xoá bình luận"));
  }
}

async function updateComment(req, res, next) {
  const { cmt_id } = req.params;
  const { cmt_content } = req.body;

  if (!cmt_content) {
    return res.status(400).json(JSend.fail("Thiếu nội dung bình luận"));
  }

  try {
    const comment = await commentService.getCommentById(cmt_id);

    if (!comment) {
      return res.status(404).json(JSend.fail("Không tìm thấy bình luận"));
    }

    
    await commentService.updateComment(cmt_id, cmt_content);

    return res.status(200).json(JSend.success("Cập nhật bình luận thành công"));
  } catch (error) {
    console.error("Lỗi khi cập nhật bình luận:", error.message);
    return next(new ApiError(500, "Lỗi khi cập nhật bình luận"));
  }
}

async function getAllComments(req, res, next) {
  try {
    const comments = await commentService.getAllCommentsWithInfo();
    return res.status(200).json(JSend.success(comments));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bình luận:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách bình luận"));
  }
}

module.exports = {
  createComment,
  getCommentsByPost,
  deleteComment,
  updateComment,
  getCommentByUserId,
  getAllComments
};
