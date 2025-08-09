const { body, param } = require("express-validator");

// Validation for creating a course
const courseCreateValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
];

// Validation for updating a course (fields optional)
const courseUpdateValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
];

// Validator for :id param (for routes that use course id)
const courseIdParamValidator = [
  param("id")
    .isInt()
    .withMessage("Course ID must be an integer"),
];

module.exports = {
  courseCreateValidator,
  courseUpdateValidator,
  courseIdParamValidator,
};
