const User = require("../models/User");
const Group = require("../models/Group");

// @desc Get all users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete user (and their posts)
// @route DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin user" });
    }
    await Group.deleteMany({ createdBy: user._id });
    await user.deleteOne();
    res.json({ success: true, message: "User and their posts deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete any post
// @route DELETE /api/admin/post/:id
const deletePost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    await group.deleteOne();
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all posts (admin view)
// @route GET /api/admin/posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Group.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get site statistics
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalPosts = await Group.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const categoryCounts = await Group.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentPosts = await Group.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalAdmins,
        categoryCounts,
        recentUsers,
        recentPosts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update post status (approve/reject)
// @route PUT /api/admin/post/:id/status
const updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("createdBy", "name email");
    if (!group) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle user verification badge
// @route PUT /api/admin/post/:id/verify
const verifyPost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    group.isVerified = !group.isVerified;
    await group.save();
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, deleteUser, deletePost, getAllPosts, getStats, updatePostStatus, verifyPost };
