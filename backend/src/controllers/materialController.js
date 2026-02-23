// const material =require("../models/Material")

// //const Material = require("../models/Material");

// // POST /api/materials (ADMIN only)
// exports.createMaterial = async (req, res) => {
//   try {
//     const { name, category, unit } = req.body;

//     if (!name || !category || !unit) {
//       return res.status(400).json({
//         success: false,
//         message: "name, category, and unit are required",
//       });
//     }

//     const cleanName = String(name).trim().toUpperCase();
//     const cleanCategory = String(category).trim().toLowerCase();n
//     const cleanUnit = String(unit).trim().toLowerCase();

//     const allowedCategories = ["plastic", "metal", "paper", "glass", "other"];
//     const allowedUnits = ["kg", "pcs"];

//     if (!allowedCategories.includes(cleanCategory)) {
//       return res.status(400).json({ success: false, message: "Invalid category" });
//     }

//     if (!allowedUnits.includes(cleanUnit)) {
//       return res.status(400).json({ success: false, message: "Invalid unit" });
//     }

//     const exists = await Material.findOne({ name: cleanName });
//     if (exists) {
//       return res.status(409).json({ success: false, message: "Material already exists" });
//     }

//     const material = await Material.create({
//       name: cleanName,
//       category: cleanCategory,
//       unit: cleanUnit,
//     });

//     return res.status(201).json({ success: true, data: material });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/materials (any logged-in user)
// exports.getMaterials = async (req, res) => {
//   try {
//     const onlyActive = String(req.query.active || "true") === "true";

//     const filter = onlyActive ? { active: true } : {};
//     const materials = await Material.find(filter).sort({ name: 1 });

//     return res.status(200).json({
//       success: true,
//       count: materials.length,
//       data: materials,
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/materials/:id (any logged-in user)
// exports.getMaterialById = async (req, res) => {
//   try {
//     const material = await Material.findById(req.params.id);

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Material not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: material,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid material id",
//     });
//   }
// };

// // PATCH /api/materials/:id (ADMIN only)
// exports.updateMaterial = async (req, res) => {
//   try {
//     const { name, category, unit, active } = req.body;

//     const updates = {};
//     if (name !== undefined) updates.name = String(name).trim().toUpperCase();
//     if (category !== undefined) updates.category = String(category).trim().toLowerCase();
//     if (unit !== undefined) updates.unit = String(unit).trim().toLowerCase();
//     if (active !== undefined) updates.active = Boolean(active);

//     const allowedCategories = ["plastic", "metal", "paper", "glass", "other"];
//     const allowedUnits = ["kg", "pcs"];

//     if (updates.category && !allowedCategories.includes(updates.category)) {
//       return res.status(400).json({ success: false, message: "Invalid category" });
//     }

//     if (updates.unit && !allowedUnits.includes(updates.unit)) {
//       return res.status(400).json({ success: false, message: "Invalid unit" });
//     }

//     // prevent duplicates when changing name
//     if (updates.name) {
//       const exists = await Material.findOne({
//         name: updates.name,
//         _id: { $ne: req.params.id },
//       });

//       if (exists) {
//         return res.status(409).json({
//           success: false,
//           message: "Material already exists",
//         });
//       }
//     }

//     const material = await Material.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Material not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Material updated",
//       data: material,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request",
//     });
//   }
// };

// // DELETE /api/materials/:id (ADMIN only) - Soft delete
// exports.deleteMaterial = async (req, res) => {
//   try {
//     const material = await Material.findByIdAndUpdate(
//       req.params.id,
//       { active: false },
//       { new: true }
//     );

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Material not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Material deactivated",
//       data: material,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid material id",
//     });
//   }
// };






const Material = require("../models/material");

// POST /api/materials (ADMIN only)
exports.createMaterial = async (req, res) => {
  try {
    const { name, category, unit } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({
        success: false,
        message: "name, category, and unit are required",
      });
    }

    const cleanName = String(name).trim().toUpperCase();
    const cleanCategory = String(category).trim().toLowerCase();
    const cleanUnit = String(unit).trim().toLowerCase();

    const allowedCategories = ["plastic", "metal", "paper", "glass", "other"];
    const allowedUnits = ["kg", "pcs"];

    if (!allowedCategories.includes(cleanCategory)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    if (!allowedUnits.includes(cleanUnit)) {
      return res.status(400).json({ success: false, message: "Invalid unit" });
    }

    const exists = await Material.findOne({ name: cleanName });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Material already exists",
      });
    }

    const material = await Material.create({
      name: cleanName,
      category: cleanCategory,
      unit: cleanUnit,
      // active defaults to true in schema
    });

    return res.status(201).json({ success: true, data: material });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials (any logged-in user)
exports.getMaterials = async (req, res) => {
  try {
    const onlyActive = String(req.query.active || "true") === "true";
    const filter = onlyActive ? { active: true } : {};

    const materials = await Material.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials/:id (any logged-in user)
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: material,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid material id",
    });
  }
};

// PATCH /api/materials/:id (ADMIN only)
exports.updateMaterial = async (req, res) => {
  try {
    const { name, category, unit, active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim().toUpperCase();
    if (category !== undefined) updates.category = String(category).trim().toLowerCase();
    if (unit !== undefined) updates.unit = String(unit).trim().toLowerCase();
    if (active !== undefined) updates.active = Boolean(active);

    const allowedCategories = ["plastic", "metal", "paper", "glass", "other"];
    const allowedUnits = ["kg", "pcs"];

    if (updates.category && !allowedCategories.includes(updates.category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    if (updates.unit && !allowedUnits.includes(updates.unit)) {
      return res.status(400).json({ success: false, message: "Invalid unit" });
    }

    // Prevent duplicates when changing name
    if (updates.name) {
      const exists = await Material.findOne({
        name: updates.name,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Material already exists",
        });
      }
    }

    const material = await Material.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material updated",
      data: material,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};

// DELETE /api/materials/:id (ADMIN only) - soft delete
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material deactivated",
      data: material,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid material id",
    });
  }
};