const express = require("express")
const router = express.Router()

const groupController = require("../controllers/groupController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/", authMiddleware ,groupController.getAllMyGroups)
    .post("/", authMiddleware, groupController.createGroup)

router.get("/:id", authMiddleware, groupController.viewGroupDetails)
    .patch("/:id", authMiddleware , groupController.updateGroupName)
    .delete("/:id", authMiddleware , groupController.deleteGroup) //doar owner ul

router.get("/:id/members", authMiddleware , groupController.getMembersFromGroup)
    .post("/:id/members", authMiddleware , groupController.addMemberInGroup) //doar owner-ul

router.delete("/:id/members/me",authMiddleware , groupController.leaveGroup)

module.exports  = router