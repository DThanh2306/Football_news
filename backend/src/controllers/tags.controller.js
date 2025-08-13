const ApiError = require("../api-error");
const JSend = require("../jsend");
const tagsService = require("../services/tags.service");
const slugify = require("slugify");

async function createTag(req, res, next) {
  const { tag_name } = req.body || {};
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  if (!tag_name) return res.status(400).json(JSend.fail("Thiếu tên tag"));

  const tag_slug = slugify(tag_name, { lower: true, strict: true });

  try {
    await tagsService.transaction(async (trx) => {
      const exists = await tagsService.checkSlugExists(tag_slug, trx);
      if (exists) throw new ApiError(400, "Slug tag đã tồn tại");

      const data = { tag_name, tag_slug, tag_create_at: new Date() };
      const result = await tagsService.createTag(data, trx);

      return res.status(201).json(JSend.success({ tag_id: result.tag_id }));
    });
  } catch (error) {
    console.error("Lỗi khi tạo tag:", error.message);
    if (error instanceof ApiError) return res.status(error.statusCode).json(JSend.fail(error.message));
    return next(new ApiError(500, "Lỗi khi tạo tag"));
  }
}

async function getTagById(req, res, next) {
  const { tag_id } = req.params;
  try {
    const tag = await tagsService.getTagById(tag_id);
    if (!tag) return res.status(404).json(JSend.fail("Không tìm thấy tag"));
    return res.status(200).json(JSend.success(tag));
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết tag:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy chi tiết tag"));
  }
}

async function getAllTags(req, res, next) {
  const { page = 1, limit = 50, search } = req.query;
  try {
    const rows = await tagsService.getAllTags({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    return res.status(200).json(JSend.success(rows));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tags:", error.message);
    return next(new ApiError(500, "Lỗi khi lấy danh sách tags"));
  }
}

async function updateTag(req, res, next) {
  const { tag_id } = req.params;
  const { tag_name, tag_slug } = req.body || {};
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const updateData = {};
    if (tag_name) {
      updateData.tag_name = tag_name;
      if (!tag_slug) updateData.tag_slug = slugify(tag_name, { lower: true, strict: true });
    }
    if (tag_slug) updateData.tag_slug = tag_slug;

    const updated = await tagsService.updateTag(tag_id, updateData);
    if (updated === 0) return res.status(404).json(JSend.fail("Không tìm thấy tag"));

    return res.status(200).json(JSend.success("Cập nhật tag thành công"));
  } catch (error) {
    console.error("Lỗi khi cập nhật tag:", error.message);
    return next(new ApiError(500, "Lỗi khi cập nhật tag"));
  }
}

async function deleteTag(req, res, next) {
  const { tag_id } = req.params;
  if (req.user.role !== "admin") return res.status(403).json(JSend.fail("Bạn không có quyền"));

  try {
    const deleted = await tagsService.deleteTag(tag_id);
    if (deleted === 0) return res.status(404).json(JSend.fail("Không tìm thấy tag"));
    return res.status(200).json(JSend.success("Xoá tag thành công"));
  } catch (error) {
    console.error("Lỗi khi xoá tag:", error.message);
    return next(new ApiError(500, "Lỗi khi xoá tag"));
  }
}

module.exports = {
  createTag,
  getTagById,
  getAllTags,
  updateTag,
  deleteTag,
};
