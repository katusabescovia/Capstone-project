// src/middleware/ownership.js
const Material = require('../models/Material');

const checkMaterialOwner = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this material'
      });
    }

    // Attach material to req for controller use
    req.material = material;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { checkMaterialOwner };