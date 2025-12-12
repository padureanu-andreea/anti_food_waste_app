const express = require("express");
const router = express.Router();
const debugGroupsController = require("../controllers/debugGroupsController");

router
    .get("/groups", debugGroupsController.getAllGroups)
    .post("/groups", debugGroupsController.postGroup)
    .patch("/groups/:id", debugGroupsController.changeGroupName)
    .patch("/groups/:id/owner",debugGroupsController.changeGroupOwner)
    .delete("/groups/:id", debugGroupsController.deleteGroup);

module.exports = router;
