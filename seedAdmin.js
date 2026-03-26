const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "admin@groupshare.com";
    const password = "adminpassword123";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin User",
      email,
      password,
      role: "admin",
    });

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
