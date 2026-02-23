const { body } = require("express-validator");

exports.createListingRules = [
  body("title")
    .notEmpty()
    .withMessage("title is required")
    .trim(),

  body("category")
    .notEmpty()
    .withMessage("category is required")
    .trim(),

  body("location")
    .notEmpty()
    .withMessage("location is required")
    .trim(),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("quantity must be greater than 0")
    .toFloat(),

  body("measurementUnit")
    .optional()
    .isIn(["kg", "g", "ton"])
    .withMessage("measurementUnit must be kg, g, or ton"),
];

exports.calculatePriceRules = [
  body("category")
    .notEmpty()
    .withMessage("category is required")
    .trim(),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("quantity must be greater than 0")
    .toFloat(),

  body("measurementUnit")
    .optional()
    .isIn(["kg", "g", "ton"])
    .withMessage("measurementUnit must be kg, g, or ton"),
];