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
  incrementView,
} = require("../controllers/groupController");
const { protect, getAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Base route is already taken by getGroups, so we'll add a helper route
router.get("/status", (req, res) => {
  res.json({ message: "Groups API is running!" });
});

router.get("/", getGroups);
router.get("/my-groups", protect, getMyGroups);
router.get("/:id", getGroup);
router.post("/", protect, upload.single("groupImage"), createGroup);
router.put("/:id", protect, upload.single("groupImage"), updateGroup);
router.delete("/:id", protect, deleteGroup);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/view", getAuth, incrementView);


module.exports = router;
