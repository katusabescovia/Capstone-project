// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const User = require("./models/User");

const materialRoutes = require("./routes/materialRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const authRoutes = require("./routes/authRoutes");
const addressRoutes = require("./routes/addressRoutes");
const listingRoutes = require("./routes/listingRoutes");
const listingItemRoutes = require("./routes/listingItemRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

//  Ensure uploads folder exists (Windows safe)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//  Serve uploaded files publicly
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/pickups", pickupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/listing-items", listingItemRoutes);
app.use("/api/materials", materialRoutes);

// Debug route (optional)
app.get("/check-users", async (req, res) => {
  try {
    const users = await User.find().select("email role");
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post("/debug", (req, res) => {
  res.status(200).json({
    contentType: req.headers["content-type"] || null,
    authorization: req.headers.authorization || null,
    body: req.body || null,
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API running" });
});

console.log("APP.JS LOADED - ROUTES MOUNTED");

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;