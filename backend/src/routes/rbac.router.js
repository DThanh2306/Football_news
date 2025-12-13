const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/authorize.middleware");
const JSend = require("../jsend");
const permissions = require("../config/permission");

router.get("/rbac-check", verifyToken, (req, res) => {
  const { resource, action } = req.query || {};
  const role = req.user?.role;
  const allowed = resource && action ? hasPermission(role, resource, action) : null;
  return res.json(JSend.success({
    role,
    resource: resource || null,
    action: action || null,
    allowed,
    allowedActions: permissions[role]?.[resource] || [],
  }));
});

module.exports = {
  setup(app) {
    app.use("/api", router);
  },
};
