const mongoose = require("mongoose");
const User = require("../models/user");
const Material = require("../models/material");

// GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalRecyclers,
      totalAdmins,
      totalMaterials,
      availableMaterials,
      acceptedMaterials,
      pickupConfirmedMaterials,
      rejectedMaterials,
      cancelledMaterials,
      totalQuantityAgg,
      totalConfirmedQuantityAgg,
      totalEstimatedValueAgg,
      totalConfirmedValueAgg,
      recentUsers,
      recentMaterials,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "recycler" }),
      User.countDocuments({ role: "admin" }),

      Material.countDocuments(),
      Material.countDocuments({ status: "available" }),
      Material.countDocuments({ status: "accepted" }),
      Material.countDocuments({ status: "pickup_confirmed" }),
      Material.countDocuments({ status: "rejected" }),
      Material.countDocuments({ status: "cancelled" }),

      Material.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$quantity" },
          },
        },
      ]),

      Material.aggregate([
        { $match: { status: "pickup_confirmed" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$actualQuantity" },
          },
        },
      ]),

      Material.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]),

      Material.aggregate([
        { $match: { status: "pickup_confirmed" } },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$actualQuantity", "$pricePerUnit"] },
            },
          },
        },
      ]),

      User.find()
        .select("fullName email phone location role createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Material.find()
        .populate("seller", "fullName email phone location")
        .populate("acceptedBy", "fullName email phone location")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        users: {
          totalUsers,
          totalSellers,
          totalRecyclers,
          totalAdmins,
        },
        materials: {
          totalMaterials,
          availableMaterials,
          acceptedMaterials,
          pickupConfirmedMaterials,
          rejectedMaterials,
          cancelledMaterials,
        },
        analytics: {
          totalQuantity: totalQuantityAgg[0]?.total || 0,
          totalConfirmedQuantity: totalConfirmedQuantityAgg[0]?.total || 0,
          totalEstimatedValue: totalEstimatedValueAgg[0]?.total || 0,
          totalConfirmedValue: totalConfirmedValueAgg[0]?.total || 0,
        },
        recentUsers,
        recentMaterials,
      },
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const role = req.body.role?.toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!role || !["seller", "recycler", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required: seller, recycler, or admin",
      });
    }

    const existingUser = await User.findById(req.params.id).select("-password");

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.user && req.user._id.toString() === req.params.id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove their own admin role",
      });
    }

    if (existingUser.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change the last admin to a non-admin role",
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (req.user && req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete their own account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin",
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// GET /api/admin/materials
exports.getAllMaterialsForAdmin = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate("seller", "fullName email phone location")
      .populate("acceptedBy", "fullName email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("getAllMaterialsForAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

// GET /api/admin/materials/:id
exports.getMaterialByIdForAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(req.params.id)
      .populate("seller", "fullName email phone location")
      .populate("acceptedBy", "fullName email phone location");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("getMaterialByIdForAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch material",
      error: error.message,
    });
  }
};

// PATCH /api/admin/materials/:id/status
exports.updateMaterialStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "available",
      "accepted",
      "pickup_confirmed",
      "rejected",
      "cancelled",
    ];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status is required: ${allowedStatuses.join(", ")}`,
      });
    }

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    material.status = status;
    await material.save();

    const updatedMaterial = await Material.findById(material._id)
      .populate("seller", "fullName email phone location")
      .populate("acceptedBy", "fullName email phone location");

    return res.status(200).json({
      success: true,
      message: "Material status updated successfully",
      material: updatedMaterial,
    });
  } catch (error) {
    console.error("updateMaterialStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update material status",
      error: error.message,
    });
  }
};

// DELETE /api/admin/materials/:id
exports.deleteMaterialForAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("deleteMaterialForAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message,
    });
  }
};