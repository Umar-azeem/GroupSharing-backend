const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const findAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await User.find({ role: "admin" });
    if (admins.length === 0) {
      console.log("No admins found in the database.");
    } else {
      console.log("Admins found:");
      admins.forEach(admin => {
        console.log(`- Name: ${admin.name}, Email: ${admin.email}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error("Error finding admins:", error);
    process.exit(1);
  }
};

findAdmins();
