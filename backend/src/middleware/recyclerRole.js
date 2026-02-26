// src/middleware/auth.js  (or recyclerRole.js)
exports.checkRecyclerRole = (req, res, next) => {
  if (req.user.role !== 'recycler') {
    return res.status(403).json({
      success: false,
      message: 'Only recyclers are allowed to perform this action'
    });
  }
  next();
};