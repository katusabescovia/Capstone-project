const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const listingItemController = require("../controllers/listingItemController");

// /api/listings/:listingId/items
router.post("/:listingId/items", protect, listingItemController.createListingItem);
router.get("/:listingId/items", protect, listingItemController.getItemsByListing);

module.exports = router;