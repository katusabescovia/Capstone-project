const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true, // PET, HDPE
    },
    category: {
      type: String,
      required: true,
      enum: ["plastic", "metal", "paper", "glass", "other"],
      lowercase: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "pcs"],
      lowercase: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Material || mongoose.model("Material", materialSchema);
