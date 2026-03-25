const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    groupLink: {
      type: String,
      required: [true, "Group link is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Tech", "Business", "Gaming", "Education", "Crypto", "Entertainment", "Other"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "pending", "rejected"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Index for search
groupSchema.index({ groupName: "text", description: "text", category: 1 });
module.exports = mongoose.model("Group", groupSchema);
