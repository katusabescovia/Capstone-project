// src/app.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// debug route (so you can test body)
app.post("/debug", (req, res) => {
  res.status(200).json({
    contentType: req.headers["content-type"] || null,
    body: req.body || null,
  });
});

// health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API running" });
});

module.exports = app;