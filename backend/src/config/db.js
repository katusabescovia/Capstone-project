// src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is missing in .env file");
  }

  await mongoose.connect(mongoURI);
  console.log("✅ MongoDB connected");
};

module.exports = { connectDB };