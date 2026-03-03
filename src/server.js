// // src/server.js
// require("dotenv").config();

// const app = require("./app");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });

//   } catch (err) {
//     console.error("Server failed to start:", err.message);
//     process.exit(1);
//   }
// };

// startServer();


// src/server.js

// ────────────────────────────────────────────────────────────────
// Force public DNS servers FIRST (fixes SRV lookup failure on Windows/Node)
// This must be BEFORE dotenv, mongoose, or any connection attempt
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]); // Cloudflare + Google

// Optional: log current DNS servers to confirm (remove after testing)
// console.log("DNS servers set to:", dns.getServers());

// ────────────────────────────────────────────────────────────────
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
};

startServer();