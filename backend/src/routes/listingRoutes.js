const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listingController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { upload } = require("../middleware/upload");

const validate = require("../middleware/validate");
const {
  createListingRules,
  calculatePriceRules,
} = require("../validations/listingValidation");

// CREATE listing (Seller only)
router.post(
  "/",
  protect,
  requireRole("seller"),
  upload.array("photos", 5),
  createListingRules,
  validate,
  listingController.createListing
);

// CALCULATE PRICE (Seller only) — MUST be before "/:id"
router.post(
  "/calculate-price",
  protect,
  requireRole("seller"),
  calculatePriceRules,
  validate,
  listingController.calculateListingPrice
);


// GET ALL listings (Admin only)
router.get("/", protect, requireRole("admin"), listingController.getAllListings);

//  GET ONE listing (Protected)
router.get("/:id", protect, listingController.getListingById);

module.exports = router;