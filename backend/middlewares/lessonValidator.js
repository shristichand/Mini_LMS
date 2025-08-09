const { body, param } = require("express-validator");

// Params
const courseIdParamValidator = [
  param("courseId").isInt().withMessage("courseId must be an integer"),
];

const lessonIdParamValidator = [
  param("lessonId").isInt().withMessage("lessonId must be an integer"),
];

// Create
const lessonCreateValidator = [
  body("title")
    .notEmpty()
    .withMessage("Lesson title is required")
    .isString()
    .withMessage("Lesson title must be a string")
    .isLength({ min: 3 })
    .withMessage("Lesson title must be at least 3 characters"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("videoTitle")
    .optional()
    .isString()
    .withMessage("Video title must be a string")
    .isLength({ min: 3 })
    .withMessage("Video title must be at least 3 characters"),

  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Video URL must be a valid URL"),

  body("videoDuration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Video duration must be a positive integer (seconds)"),
];

// Update
const lessonUpdateValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Lesson title must be a string")
    .isLength({ min: 3 })
    .withMessage("Lesson title must be at least 3 characters"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("videoTitle")
    .optional()
    .isString()
    .withMessage("Video title must be a string")
    .isLength({ min: 3 })
    .withMessage("Video title must be at least 3 characters"),

  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Video URL must be a valid URL"),

  body("videoDuration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Video duration must be a positive integer (seconds)"),
];

module.exports = {
  courseIdParamValidator,
  lessonIdParamValidator,
  lessonCreateValidator,
  lessonUpdateValidator,
};


