// const express = require('express');
// const router = express.Router();

// const upload = require('../middleware/upload');
// const { protect } = require('../middleware/auth');
// const { checkMaterialOwner } = require('../middleware/ownership');
// const { checkRecyclerRole } = require('../middleware/auth');

// const {
//   createMaterial,
//   getAllMaterials,
//   getMaterialById,
//   updateMaterial,
//   deleteMaterial,
//   getMyMaterials
// } = require('../controllers/materialController');



// // Protected seller routes
// router.post('/', protect, upload, createMaterial);
// router.get('/my-listings', protect, getMyMaterials);

// router.get('/my/:id', protect, checkMaterialOwner, getMaterialById);
// // Protected + ownership check
// router.put('/:id', protect, checkMaterialOwner, upload, updateMaterial);
// router.delete('/:id', protect, checkMaterialOwner, deleteMaterial);

// module.exports = router;


// // / Public routes
// router.get('/', getAllMaterials);               // all users / recyclers
// router.get('/:id', getMaterialById);



// // ... existing imports and routes ...

// // ────────────────────────────────────────────────
// // ────────────────────────────────────────────────
// // RECYCLER ROUTES (add after seller routes)
// // ────────────────────────────────────────────────
// router.post('/:id/accept', protect, checkRecyclerRole, acceptMaterial);

// router.post('/:id/reject', protect, checkRecyclerRole, rejectMaterial);

// router.post('/:id/cancel-accept', protect, checkRecyclerOwnership, cancelAccept);

// router.get('/my-accepted', protect, checkRecyclerRole, getMyAccepted);

// router.get('/my-accepted/:id', protect, checkRecyclerOwnership, getMyAcceptedById);

// router.post(
//   '/:id/confirm-pickup',
//   protect,
//   checkRecyclerOwnership,
//   upload.array('proofPhotos', 5), // allow up to 5 proof photos
//   confirmPickup
// );

// module.exports = router;














const express = require('express');
const router = express.Router();

const { singlePhoto, multipleProof } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { checkRecyclerRole, checkAdminRole, checkSellerRole } =
  require('../middleware/auth');// ← added checkAdminRole
const { checkMaterialOwner } = require('../middleware/ownership');
const { checkRecyclerOwnership } = require('../middleware/recyclerOwnership');

// If checkRecyclerOwnership is in a separate file:
// const { checkRecyclerOwnership } = require('../middleware/recyclerOwnership');

// IMPORTANT: Destructure ALL controller functions here
const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getMyMaterials,
  acceptMaterial,           // ← must be listed
  rejectMaterial,
  cancelAccept,             // ← camelCase as in controller
  getMyAccepted,
  getMyAcceptedById,
  confirmPickup,
  getMyAcceptedProducts,
  getAdminDashboard,         // ← ADD THIS LINE
  getSellerDashboard,     // add if you want seller dashboard
  getRecyclerDashboard
} = require('../controllers/materialController');

// ────────────────────────────────────────────────
// PUBLIC ROUTES (no auth)
// ────────────────────────────────────────────────
router.get('/', getAllMaterials);
// Admin dashboard
router.get('/admin/dashboard', protect, checkAdminRole, getAdminDashboard);

// Seller dashboard
router.get('/seller/dashboard', protect, checkSellerRole, getSellerDashboard);

// Recycler dashboard
router.get('/recycler/dashboard', protect, checkRecyclerRole, getRecyclerDashboard);


// ────────────────────────────────────────────────
// PROTECTED SELLER ROUTES

// ────────────────────────────────────────────────
router.post('/', protect, singlePhoto, createMaterial);
router.get('/my-listings', protect, getMyMaterials);
router.get('/my-accepted-products', protect, getMyAcceptedProducts);
router.get('/my/:id', protect, checkMaterialOwner, getMaterialById);
// Seller edit & delete (ownership check)
router.put('/:id', protect, checkMaterialOwner, singlePhoto, updateMaterial);
router.delete('/:id', protect, checkMaterialOwner, deleteMaterial);


// ────────────────────────────────────────────────
// RECYCLER ROUTES – use imported function names ONLY
// ────────────────────────────────────────────────
router.post('/:id/accept', protect, checkRecyclerRole, acceptMaterial);

router.post('/:id/reject', protect, checkRecyclerRole, rejectMaterial);

router.post('/:id/cancel-accept', protect, checkRecyclerOwnership, cancelAccept);

router.get('/my-accepted', protect, checkRecyclerRole, getMyAccepted);

router.get('/my-accepted/:id', protect, checkRecyclerOwnership, getMyAcceptedById);


// / Seller views accepted products
router.get('/:id', getMaterialById);


// Recycler confirm pickup (multiple proof photos)
router.post(
  '/:id/confirm-pickup',
  protect,
  checkRecyclerOwnership,
  multipleProof,   // ← use the new multiple one
  confirmPickup
);

module.exports = router;