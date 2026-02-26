// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');

// ─── Import your routes ───────────────────────────────────────────────
const authRoutes = require('../routes/authRoutes');
const addressRoutes = require('../routes/addressRoutes');
const materialRoutes = require('../routes/materialRoutes');

// ─── Create Express app ───────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: true,                    // ← allow all for now (tighten later)
  credentials: true,
}));
app.use(express.json());

// ─── Connect to MongoDB using env var ─────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected in Netlify Function'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── Mount your routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/materials', materialRoutes);

// Optional debug routes (keep if you want)
app.get('/check-users', async (req, res) => {
  try {
    const User = require('../../models/User');
    const users = await User.find().select('email role');
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running on Netlify Functions' });
});

// ─── Export for Netlify Functions ─────────────────────────────────────
module.exports.handler = serverless(app);