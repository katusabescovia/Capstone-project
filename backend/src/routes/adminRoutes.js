const express = require("express");
const router = express.Router();

const { protect, checkAdminRole } = require("../middleware/auth");
const {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllMaterialsForAdmin,
  getMaterialByIdForAdmin,
  updateMaterialStatus,
  deleteMaterialForAdmin,
} = require("../controllers/adminController");

router.use(protect, checkAdminRole);

router.get("/dashboard", getAdminDashboard);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/materials", getAllMaterialsForAdmin);
router.get("/materials/:id", getMaterialByIdForAdmin);
router.patch("/materials/:id/status", updateMaterialStatus);
router.delete("/materials/:id", deleteMaterialForAdmin);

module.exports = router;