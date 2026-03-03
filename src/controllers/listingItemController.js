const ListingItem = require("../models/ListingItem");
const Listing = require("../models/Listing");
const Material = require("../models/material");

// POST /api/listings/:listingId/items
exports.createListingItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { material, quantity, estimatedWeight, photoUrl } = req.body;

    if (!material || !quantity) {
      return res.status(400).json({
        success: false,
        message: "material and quantity are required",
      });
    }

    // 1) listing must exist
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // 2) user must own listing OR be admin
    const isAdmin = req.user.role === "admin";
    const isOwner = listing.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you cannot add items to this listing",
      });
    }

    // 3) material must exist
    const materialExists = await Material.findById(material);
    if (!materialExists) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // 4) create item
    const item = await ListingItem.create({
      listing: listingId,
      material,
      quantity: Number(quantity),
      estimatedWeight: estimatedWeight ? Number(estimatedWeight) : undefined,
      photoUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Listing item created successfully",
      data: item,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/listings/:listingId/items
exports.getItemsByListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // listing must exist
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // user must own listing OR be admin
    const isAdmin = req.user.role === "admin";
    const isOwner = listing.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you cannot view items for this listing",
      });
    }

    const items = await ListingItem.find({ listing: listingId })
      .populate("material", "name category unit")
      .populate("listing");

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return next(error);
  }
};