const Address = require("../models/Address");

// POST /api/addresses
const createAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, country, lat, lng, isDefault } = req.body;

    const address = await Address.create({
      user: req.user._id,
      label,
      street,
      city,
      state,
      country,
      lat,
      lng,
      isDefault: Boolean(isDefault),
    });

    return res.status(201).json({ ok: true, data: address });
  } catch (err) {
    next(err);
  }
};

// GET /api/addresses
const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ ok: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAddress, getMyAddresses };
