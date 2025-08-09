const { body, param } = require("express-validator");

const videoIdParamValidator = [
  param("videoId").isInt().withMessage("videoId must be an integer"),
];

const updateProgressValidator = [
  body("watchedDuration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("watchedDuration must be a non-negative integer (seconds)"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed must be a boolean"),
];

module.exports = {
  videoIdParamValidator,
  updateProgressValidator,
};


