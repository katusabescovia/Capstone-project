const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Figma fields
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ NEW: Weight & Pricing (from your UI)

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    measurementUnit: {
      type: String,
      enum: ["kg", "g", "ton"],
      default: "kg",
    },

    price: {
      type: Number,
      default: 0,
    },

    // ✅ Photos
    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["open", "accepted", "picked_up", "completed"],
      default: "open",
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);