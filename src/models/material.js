const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photo: {
      type: String,
      default: null, // will be /uploads/filename.jpg if uploaded
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Pet Plastic Bottles (Water, Soda)',
        'Sachet Plastics (Pure Water)',
        'Plastic Plates',
        'HDPE Plastic Containers',
        'Plastic Bags',
        'Other Plastic Waste',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['tons', 'kgs', 'g'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be at least 0.001'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [1, 'Price must be at least 1 NGN'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

  status: {
    type: String,
    enum: ['available', 'accepted', 'pickup_confirmed', 'rejected', 'cancelled'],
    default: 'available'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actualQuantity: {
    type: Number,
    default: 0
  },
  pickupProof: [{
    type: String // array of /uploads/... paths
  }],
  pickupNotes: {
    type: String,
    default: ''
  },
  confirmedAt: {
    type: Date,
    default: null
  },

  acceptedAt: { // ← NEW
      type: Date,
      default: null
    },
  },

  { timestamps: true }
);




module.exports = mongoose.models.Material || mongoose.model('Material', materialSchema);