const express = require("express");
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleLike,
  getMyGroups,
} = require("../controllers/groupController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getGroups);
router.get("/my-groups", protect, getMyGroups);
router.get("/:id", getGroup);
router.post("/", protect, upload.single("groupImage"), createGroup);
router.put("/:id", protect, upload.single("groupImage"), updateGroup);
router.delete("/:id", protect, deleteGroup);
router.post("/:id/like", protect, toggleLike);

module.exports = router;
