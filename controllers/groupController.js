const Group = require("../models/Group");
const cloudinary = require("../config/cloudinary");
// @desc Get all groups with search, filter, pagination
// @route GET /api/groups
const getGroups = async (req, res) => {
  try {
    const {
      search,
      category,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: "active" };

    if (search) {
      query.$or = [
        { groupName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { views: -1 };
        break;
      case "trending":
        sortOption = { likes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Group.countDocuments(query);
    const groups = await Group.find(query)
      .populate("createdBy", "name profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      groups,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single group
// @route GET /api/groups/:id
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "createdBy",
      "name profileImage email",
    );
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    // Increment views
    await Group.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create group
// @route POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { groupName, groupLink, description, category } = req.body;

    if (!groupName || !groupLink || !description || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let imageUrl = "";

    if (req.file) {
      // FIX 1: folder "groups" hona chahiye "profiles" nahi
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "groups" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    // FIX 2: URL string directly di ho to bhi save karo
    if (!imageUrl && req.body.groupImage) {
      imageUrl = req.body.groupImage;
    }

    const group = await Group.create({
      groupName,
      groupLink,
      description,
      category,
      createdBy: req.user._id,
      // FIX 3: "imageUrl" nahi, schema field "groupImage" hona chahiye
      imageUrl: imageUrl,
    });

    await group.populate("createdBy", "name profileImage");

    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update group
// @route PUT /api/groups/:id
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Check ownership
    if (
      group.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    const { groupName, groupLink, description, category } = req.body;
    const updateData = { groupName, groupLink, description, category };

    if (req.file) {
      // FIX 4: cloudinary upload missing tha, result bhi define nahi tha
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "groups" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });
      const result = await uploadPromise;
      updateData.imageUrl = result.secure_url;
    }

    // URL string directly di ho to bhi save karo
    if (!req.file && req.body.groupImage) {
      updateData.imageUrl = req.body.groupImage;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("createdBy", "name profileImage");

    res.json({ success: true, group: updatedGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete group
// @route DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (
      group.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await group.deleteOne();
    res.json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle like on group
// @route POST /api/groups/:id/like
const toggleLike = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const userId = req.user._id.toString();
    const isLiked = group.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      group.likes = group.likes.filter((id) => id.toString() !== userId);
    } else {
      group.likes.push(req.user._id);
    }

    await group.save();
    res.json({ success: true, likes: group.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user's own groups
// @route GET /api/groups/my-groups
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profileImage");
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleLike,
  getMyGroups,
};