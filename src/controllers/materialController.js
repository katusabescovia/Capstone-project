const Material = require("../models/Material");
const User = require("../models/User");   // ✅ ADD THIS

exports.createMaterial = async (req, res) => {
  try {
    const { title, description, category, unit, quantity, pricePerUnit } = req.body;
    const seller = req.user;

    // Required fields check
    if (!title || !description || !category || !unit || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field(s)',
      });
    }

    const qty = Number(quantity);
    const price = Number(pricePerUnit);

    if (isNaN(qty) || qty < 0.001) {
      return res.status(400).json({ success: false, message: 'Invalid quantity (min 0.001)' });
    }
    if (isNaN(price) || price < 1) {
      return res.status(400).json({ success: false, message: 'Invalid price (min 1)' });
    }

    const totalPrice = qty * price;

    // Auto-fill location from seller profile
    const location = (seller.location || 'Not specified').trim();

    let photo = null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const material = await Material.create({
      seller: seller._id,
      photo,
      title: title.trim(),
      description: description.trim(),
      category,
      location,
      unit,
      quantity: qty,
      pricePerUnit: price,
      totalPrice,
    });

    // Optional: show seller name/phone in response
    const populated = await material.populate('seller', 'fullName phone location');

    return res.status(201).json({
      success: true,
      message: 'Listing created',
      material: populated,
    });
  } catch (err) {
    console.error('Create material error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// Bonus: simple list endpoint (for testing)
exports.getMyMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .populate('seller', 'fullName phone location');
    res.json({ success: true, count: materials.length, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};












// Public: Get all materials
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('seller', 'fullName phone location')
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public: Get single material
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('seller', 'fullName phone location');

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update own material (allow photo change)
exports.updateMaterial = async (req, res) => {
  try {
    const material = req.material; // from ownership middleware

    const updates = req.body;

    // Allowed fields to update
    const allowedUpdates = ['title', 'description', 'category', 'unit', 'quantity', 'pricePerUnit'];
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        material[key] = updates[key];
      }
    }

    // Recalculate totalPrice if quantity or pricePerUnit changed
    if (updates.quantity || updates.pricePerUnit) {
      const qty = Number(material.quantity);
      const price = Number(material.pricePerUnit);
      if (!isNaN(qty) && !isNaN(price)) {
        material.totalPrice = qty * price;
      }
    }

    // Handle new photo (replace old one)
    if (req.file) {
      material.photo = `/uploads/${req.file.filename}`;
    }

    await material.save();

    const populated = await material.populate('seller', 'fullName phone location');

    res.json({
      success: true,
      message: 'Material updated successfully',
      material: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete own material (hard delete)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = req.material; // from ownership middleware

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  
};



// ────────────────────────────────────────────────
// RECYCLER ACTIONS
// ────────────────────────────────────────────────

// Accept a material (only if available)
exports.acceptMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (material.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This material is no longer available' });
    }

    if (req.user.role !== 'recycler') {
      return res.status(403).json({ success: false, message: 'Only recyclers can accept materials' });
    }

    material.status = 'accepted';
    material.acceptedBy = req.user._id;
    material.acceptedAt = new Date(); // Set acceptedAt timestamp
    await material.save();

    await material.populate('seller', 'fullName phone location');

    res.status(200).json({
      success: true,
      message: 'Material accepted successfully',
      material,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject (optional - just mark as rejected)
exports.rejectMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (req.user.role !== 'recycler') {
      return res.status(403).json({ success: false, message: 'Only recyclers can reject' });
    }

    material.status = 'rejected';
    await material.save();

    res.status(200).json({ success: true, message: 'Material rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel own acceptance
exports.cancelAccept = async (req, res) => {
  try {
    const material = req.material; // from middleware

    material.status = 'available';
    material.acceptedBy = null;
    await material.save();

    res.status(200).json({ success: true, message: 'Acceptance cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List recycler's accepted materials
exports.getMyAccepted = async (req, res) => {
  try {
    if (req.user.role !== 'recycler') {
      return res.status(403).json({ success: false, message: 'Only recyclers can access this' });
    }

    const materials = await Material.find({ acceptedBy: req.user._id, status: 'accepted' })
      .populate('seller', 'fullName phone location')
      .sort({ acceptedAt: -1 });

    res.json({ success: true, count: materials.length, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// View one accepted material (with ownership check)
exports.getMyAcceptedById = async (req, res) => {
  try {
    const material = req.material; // from middleware

    await material.populate('seller', 'fullName phone location');

    res.json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// Seller views their accepted/confirmed products
exports.getMyAcceptedProducts = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Only sellers can access this' });
    }

    const materials = await Material.find({
      seller: req.user._id,
      status: { $in: ['accepted', 'pickup_confirmed'] } // accepted or confirmed
    })
      .populate('acceptedBy', 'fullName phone location') // recycler details
      .populate('seller', 'fullName phone location') // seller's own details, optional
      .sort({ acceptedAt: -1 }); // newest accepted first

    res.json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (err) {
    console.error('Get my accepted products error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Confirm pickup (actual quantity, proof photos, notes)
exports.confirmPickup = async (req, res) => {
  try {
    const material = req.material; // from middleware

    const { actualQuantity, pickupNotes } = req.body;

    if (!actualQuantity || actualQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Actual quantity is required and must be positive' });
    }

    // Auto-calculate total based on original seller pricePerUnit
    const totalAmount = actualQuantity * material.pricePerUnit;

    // Handle multiple proof photos
    let proofPhotos = [];
    if (req.files && req.files.length > 0) {
      proofPhotos = req.files.map(file => `/uploads/${file.filename}`);
    }

    material.actualQuantity = actualQuantity;
    material.pickupNotes = pickupNotes || '';
    material.pickupProof = proofPhotos;
    material.status = 'pickup_confirmed';
    material.confirmedAt = new Date();

    await material.save();

    await material.populate('seller', 'fullName phone location');

    res.status(200).json({
      success: true,
      message: 'Pickup confirmed successfully',
      material,
      calculatedTotal: totalAmount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Admin dashboard stats
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['recycler', 'seller'] } }); // recyclers + sellers
    const totalSales = await Material.countDocuments({ status: 'pickup_confirmed' }); // confirmed pickups
    const activeListings = await Material.countDocuments({ status: 'available' }); // available products
    const totalQuantity = await Material.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    res.json({
      success: true,
      totalUsers,
      totalSales,
      activeListings,
      totalQuantity: totalQuantity[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller dashboard stats (logged-in seller)
exports.getSellerDashboard = async (req, res) => {
  try {
    const totalProductsAdded = await Material.countDocuments({ seller: req.user._id }); // all their materials
    const totalQuantityAdded = await Material.aggregate([
      { $match: { seller: req.user._id } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    const totalEarnings = await Material.aggregate([
      { $match: { seller: req.user._id, status: 'pickup_confirmed' } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$actualQuantity", "$pricePerUnit"] } } } }
    ]);
    const totalQuantitySold = await Material.aggregate([
      { $match: { seller: req.user._id, status: 'pickup_confirmed' } },
      { $group: { _id: null, total: { $sum: "$actualQuantity" } } }
    ]);

    res.json({
      success: true,
      totalProductsAdded,
      totalQuantityAdded: totalQuantityAdded[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
      totalQuantitySold: totalQuantitySold[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Recycler dashboard stats (logged-in recycler)
exports.getRecyclerDashboard = async (req, res) => {
  try {
    const availableProducts = await Material.countDocuments({ status: 'available' });
    const totalQuantityAvailable = await Material.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    const totalValue = await Material.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      success: true,
      availableProducts,
      totalQuantityAvailable: totalQuantityAvailable[0]?.total || 0,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
