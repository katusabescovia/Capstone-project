const express = require("express");
const router = express.Router();

const pickupController = require("../controllers/pickupController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

// Recycler creates pickup
router.post(
  "/",
  protect,
  requireRole("recycler"),
  pickupController.createPickupRequest
);

// View pickups (logged-in users)
router.get("/", protect, pickupController.getAllPickups);

// Update pickup status (logged-in users)
router.patch("/:id/status", protect, pickupController.updatePickupStatus);

module.exports = router;