const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
