const mongoose = require("mongoose");

const impactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupRequest",
    },
    plasticWeightKg: {
      type: Number,
      default: 0,
    },
    co2SavedKg: {
      type: Number,
      default: 0,
    },
    treesEquivalent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImpactLog", impactSchema);