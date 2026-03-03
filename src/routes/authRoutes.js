// const express = require("express");
// const router = express.Router();

// const authController = require("../controllers/authController");

// console.log("authController keys:", Object.keys(authController));
// console.log("typeof register:", typeof authController.register);
// console.log("typeof login:", typeof authController.login);
// const { protect } = require("../middleware/auth");


// // ✅ Figma-aligned signup: one endpoint, role from body
// router.post("/register", (req, res, next) => {
//   const role = (req.body.role || "").toLowerCase();

//   // ✅ allow only seller/recycler from frontend
//    const allowedRoles = ["seller", "recycler"];// keep "user" if your project still uses it
//   if (!allowedRoles.includes(role)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid role. Allowed roles: seller, recycler, user",
//     });
//   }

//   // ❌ block admin public signup
//   if (role === "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin registration is not allowed.",
//     });
//   }

//   next();
// }, authController.register);

// // ✅ Login (same)
// router.post("/login", authController.login);

// // ✅ Me (protected)
// router.get("/me", protect, authController.getMe);

// module.exports = router;

// //router.post("/register/user", (req, res, next) => { req.body.role = "user"; next(); }, authController.register);
// //router.post("/register/recycler", (req, res, next) => { req.body.role = "recycler"; next(); }, authController.register);













const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/protect"); 

// Debug logs (remove in production)
console.log("authController keys:", Object.keys(authController));
console.log("typeof register:", typeof authController.register);
console.log("typeof login:", typeof authController.login);

// REGISTER (with role validation middleware)
router.post("/register", (req, res, next) => {
  const role = (req.body.role || "").toLowerCase();
  const allowedRoles = ["seller", "recycler"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Allowed: seller, recycler",
    });
  }

  if (role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin registration not allowed",
    });
  }

  next();
}, authController.register);

// LOGIN
router.post("/login", authController.login);

// ME (protected)
router.get("/me", protect, authController.getMe);

module.exports = router;