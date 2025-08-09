const express = require("express");
const router = express.Router({ mergeParams: true });

const { updateProgress, getProgress, getCourseProgress } = require("../controllers/progressController");
const { videoIdParamValidator, updateProgressValidator } = require("../middlewares/progressValidator");
const { param } = require("express-validator");
const { jwtMiddleware } = require("../middlewares/jwtMiddleware");
const { validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Aggregated course progress for current user
router.get(
  "/courses/:courseId/progress",
  jwtMiddleware,
  [param("courseId").isInt().withMessage("courseId must be an integer")],
  handleValidation,
  getCourseProgress
);

// Get progress for a video for current user
router.get(
  "/videos/:videoId/progress",
  jwtMiddleware,
  videoIdParamValidator,
  handleValidation,
  getProgress
);

// Update progress for a video for current user
router.put(
  "/videos/:videoId/progress",
  jwtMiddleware,
  videoIdParamValidator.concat(updateProgressValidator),
  handleValidation,
  updateProgress
);

module.exports = router;


