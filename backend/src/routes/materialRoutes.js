const express = require("express");
const router = express.Router();

console.log("✅ materialRoutes loaded");

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

// public ping (no auth)
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "materials route mounted" });
});

// everything below requires login
router.use(protect);

// GET materials
router.get("/", getMaterials);

// GET one material
router.get("/:id", getMaterialById);

// POST create material (admin only)
router.post("/", requireRole("admin"), createMaterial);

// PATCH update material (admin only)
router.patch("/:id", requireRole("admin"), updateMaterial);

// DELETE material (admin only) - soft delete recommended
router.delete("/:id", requireRole("admin"), deleteMaterial);

module.exports = router;