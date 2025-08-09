const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createLesson,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

const {
  courseIdParamValidator,
  lessonIdParamValidator,
  lessonCreateValidator,
  lessonUpdateValidator,
} = require("../middlewares/lessonValidator");

const { validationResult } = require("express-validator");
const { jwtMiddleware } = require("../middlewares/jwtMiddleware");
const { uploadVideo } = require("../middlewares/multer");


function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// List lessons for a course
router.get(
  "/:courseId/lessons",
  courseIdParamValidator,
  handleValidation,
  getLessonsByCourse
);

// Create lesson in a course
router.post(
  "/:courseId/lessons",
  jwtMiddleware,
  uploadVideo.single("video"),
  courseIdParamValidator.concat(lessonCreateValidator),
  handleValidation,
  createLesson
);

// Update a lesson
router.put(
  "/lessons/:lessonId",
  jwtMiddleware,
  uploadVideo.single("video"),
  lessonIdParamValidator.concat(lessonUpdateValidator),
  handleValidation,
  updateLesson
);

// Delete a lesson
router.delete(
  "/lessons/:lessonId",
  lessonIdParamValidator,
  handleValidation,
  jwtMiddleware,
  deleteLesson
);

module.exports = router;


