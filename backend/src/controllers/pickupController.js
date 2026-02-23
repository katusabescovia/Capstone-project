//const PickupRequest = require("../models/PickupRequest");
const Listing = require("../models/Listing");
const ListingItem = require("../models/ListingItem");
const ImpactLog = require("../models/ImpactLog");
exports.createPickupRequest = async (req, res, next) => {
  try {
    const recyclerId = req.user._id;
    const { listingId, scheduledDate, note } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "listingId is required",
      });
    }

    // 1. Check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // 2. Only allow OPEN listings
    if (listing.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Listing is not open. Current status: ${listing.status}`,
      });
    }

    // 3. Prevent duplicate pickup
    const existing = await PickupRequest.findOne({ listing: listingId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Pickup request already exists for this listing",
      });
    }

    // 4. Create pickup request
    const pickup = await PickupRequest.create({
      listing: listingId,
      recycler: recyclerId,
      scheduledDate,
      note,
    });

    // 5. Update listing status → accepted
    listing.status = "accepted";
    await listing.save();

    return res.status(201).json({
      success: true,
      message: "Pickup request created successfully",
      data: pickup,
    });

  } catch (error) {
    return next(error);
  }
};


exports.getAllPickups = async (req, res, next) => {
  try {
    const pickups = await PickupRequest.find()
      .populate("listing")
      .populate("recycler", "email role");

    return res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });

  } catch (error) {
    return next(error);
  }
};


exports.updatePickupStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["pending", "scheduled", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    pickup.status = status;
    await pickup.save();

    // If done → update listing to picked_up
    if (status === "done") {
      await Listing.findByIdAndUpdate(pickup.listing, {
        status: "picked_up",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pickup status updated",
      data: pickup,
    });

  } catch (error) {
    return next(error);
  }
};