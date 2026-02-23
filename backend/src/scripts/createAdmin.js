require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected (seed)");

    const email = "admin@email.com";
    const password = "Admin@1234";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(" Admin already exists:", email);
      await mongoose.connection.close();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Main Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(" Admin created successfully");
    console.log("Login with:");
    console.log("Email:", email);
    console.log("Password:", password);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(" createAdmin error:", err.message);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

createAdmin();
