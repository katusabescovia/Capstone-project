const express = require("express");
const router = express.Router();

const { createAddress, getMyAddresses } = require("../controllers/addressController");
const { protect } = require("../middleware/auth"); // ✅ import protect correctly

router.use(protect); // ✅ now protect exists

router.post("/", createAddress);
router.get("/", getMyAddresses);

module.exports = router;