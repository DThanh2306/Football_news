const JSend = require("../jsend");
const permissions = require("../config/permission");

function hasPermission(role, resource, action) {
  if (!role) return false;
  const rolePerms = permissions[role];
  if (!rolePerms) return false;
  const allowedActions = rolePerms[resource];
  if (!allowedActions) return false;
  return allowedActions.includes(action);
}

function authorize(resource, action) {
  return (req, res, next) => {
    const role = req.user?.role;
    const allowed = hasPermission(role, resource, action);
    // Debug RBAC decision
    console.log(`[RBAC] role=${role} resource=${resource} action=${action} allowed=${allowed}`);
    if (!allowed) {
      return res.status(403).json(JSend.fail("You don’t have permission to perform this action"));
    }
    next();
  };
}

module.exports = {
  authorize,
  hasPermission,
};
