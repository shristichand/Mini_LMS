const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const {
  courseCreateValidator,
  courseUpdateValidator,
  courseIdParamValidator,
} = require("../middlewares/courseValidator");
const { validationResult } = require("express-validator");
const { jwtMiddleware } = require("../middlewares/jwtMiddleware");
const { uploadImage } = require("../middlewares/multer");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get("/", getCourses);

router.get("/:id", courseIdParamValidator, handleValidation, getCourseById);

router.post(
  "/",
  jwtMiddleware,
  uploadImage.single("thumbnail"),
  courseCreateValidator,
  handleValidation,
  createCourse
);

router.put(
  "/:id",
  jwtMiddleware,
  uploadImage.single("thumbnail"),
  courseIdParamValidator.concat(courseUpdateValidator),
  handleValidation,
  updateCourse
);

router.delete("/:id", courseIdParamValidator, handleValidation, jwtMiddleware, deleteCourse);

module.exports = router;
