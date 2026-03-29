const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes and ensure user is authenticated
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or account deleted" });
    }

    if (user.isFrozen) {
      return res.status(403).json({
        success: false,
        message: "Your account has been frozen by an admin. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Error] ${error.message}`);
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};

/**
 * Middleware to restrict access to admins only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Admin access required" });
  }
};

/**
 * Middleware to optionally check for authentication (does not block guests)
 * Useful for providing special data to users while still allowing guests
 */
const getAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    // If token is invalid, we still proceed as a guest
    next();
  }
};

module.exports = { protect, adminOnly, getAuth };

