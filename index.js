const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const http = require("http");
const socketManager = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketManager.init(server);
const PORT = process.env.PORT || 8000;

// CORS config
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Parse cookies
app.use(cookieParser());
// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Viewer ID Middleware
app.use((req, res, next) => {
  let viewerId = req.cookies.viewerId;
  
  if (!viewerId) {
    viewerId = crypto.randomUUID();
    res.cookie("viewerId", viewerId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      sameSite: "lax", // Secure: false for local development
    });
  }
  
  req.viewerId = viewerId;
  next();
});


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

  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io initialized`);
  });
}

module.exports = app;
