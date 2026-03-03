const Listing = require("../models/Listing");
const { calculatePrice } = require("../services/pricingService");

// ✅ CREATE (auto-calculates price if not provided)
exports.createListing = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const {
      title,
      description,
      category,
      location,
      quantity,
      measurementUnit,
      price,
    } = req.body;

    if (!title || !category || !location || !quantity) {
      return res.status(400).json({
        success: false,
        message: "title, category, location, and quantity are required",
      });
    }

    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);

    // ✅ calculate price if frontend didn't send it
    let finalPrice = price ? Number(price) : 0;
    if (!price) {
      const result = calculatePrice({ category, quantity, measurementUnit });
      if (result.ok) finalPrice = result.price;
    }

    const listing = await Listing.create({
      user: userId,
      title,
      description,
      category,
      location,
      quantity: Number(quantity),
      measurementUnit: measurementUnit || "kg",
      price: finalPrice,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Listing created",
      data: listing,
    });
  } catch (error) {
    return next(error);
  }
};

// ✅ GET ALL (Admin-only is enforced in routes)
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().populate(
      "user",
      "email role full_name"
    );

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    return next(error);
  }
};

// ✅ GET ONE (role + ownership security)
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "user",
      "email role full_name"
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const requesterId = req.user._id.toString();
    const ownerId = listing.user?._id?.toString();
    const role = req.user.role;

    if (role === "admin") {
      return res.status(200).json({ success: true, data: listing });
    }

    if (role === "seller") {
      if (requesterId !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: you can only view your own listings",
        });
      }
      return res.status(200).json({ success: true, data: listing });
    }

    if (role === "recycler") {
      return res.status(200).json({ success: true, data: listing });
    }

    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (error) {
    return next(error);
  }
};

// ✅ POST /api/listings/calculate-price
exports.calculateListingPrice = async (req, res, next) => {
  try {
    const { category, quantity, measurementUnit } = req.body;

    if (!category || !quantity) {
      return res.status(400).json({
        success: false,
        message: "category and quantity are required",
      });
    }

    const result = calculatePrice({ category, quantity, measurementUnit });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        category,
        measurementUnit: measurementUnit || "kg",
        quantity: Number(quantity),
        quantityKg: result.quantityKg,
        ratePerKg: result.ratePerKg,
        price: result.price,
      },
    });
  } catch (error) {
    return next(error);
  }
};