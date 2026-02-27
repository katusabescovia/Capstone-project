// // src/middleware/auth.js
// const { protect } = require("./protect");
// module.exports = { protect };



const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");  // Attach user without pw
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }
    next();
  } catch (error) {
    console.error("Protect middleware error:", error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }

};


// ========================
// ROLE MIDDLEWARES
// ========================
const checkAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
};

const checkSellerRole = (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ success: false, message: "Seller only" });
  }
  next();
};

const checkRecyclerRole = (req, res, next) => {
  if (req.user.role !== "recycler") {
    return res.status(403).json({ success: false, message: "Recycler only" });
  }
  next();
};

module.exports = {
  protect,
  checkAdminRole,
  checkSellerRole,
  checkRecyclerRole
};