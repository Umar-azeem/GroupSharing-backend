const express = require("express");
const router = express.Router();
const {
  getUsers,
  deleteUser,
  deletePost,
  getAllPosts,
  getStats,
  updatePostStatus,
  verifyPost,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// Health check for Admin API (No auth required)
router.get("/", (req, res) => {
  res.json({ message: "Admin API is running!" });
});

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.delete("/user/:id", deleteUser);
router.get("/posts", getAllPosts);
router.delete("/post/:id", deletePost);
router.get("/stats", getStats);
router.put("/post/:id/status", updatePostStatus);
router.put("/post/:id/verify", verifyPost);

module.exports = router;
