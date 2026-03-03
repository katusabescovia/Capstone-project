const Material = require('../models/material');

const checkRecyclerOwnership = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (req.user.role !== 'recycler') {
      return res.status(403).json({ success: false, message: 'Only recyclers can perform this action' });
    }

    if (material.acceptedBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You did not accept this listing' });
    }

    req.material = material;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { checkRecyclerOwnership };