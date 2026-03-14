const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS config
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL || "https://your-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "GroupShare API is running!" });
});



// MongoDB connection
if (process.env.NODE_ENV !== "test") {
  if (!mongoose.connection.readyState) {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("✅ MongoDB connected"))
      .catch((err) => console.error("❌ MongoDB connection error:", err));
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
