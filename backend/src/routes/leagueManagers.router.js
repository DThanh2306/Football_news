const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const leagueManagersController = require("../controllers/leagueManagers.controller");

router.get("/", verifyToken, authorize("league_managers", "read"), leagueManagersController.getAll);
router.post("/", verifyToken, authorize("league_managers", "assign"), leagueManagersController.assign);
router.delete("/:id", verifyToken, authorize("league_managers", "remove"), leagueManagersController.remove);

module.exports = {
  setup(app) {
    app.use("/api/league-managers", router);
  },
};
