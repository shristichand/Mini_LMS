const Connection = require("../database/data-source");
const { validationResult } = require("express-validator");
const Course = require("../database/entities/Course");

const courseRepo = Connection.getRepository(Course);

async function findCourseOrFail(id) {
  const course = await courseRepo.findOne({
    where: { id },
    relations: ["lessons", "lessons.video"],
    order: { lessons: { order: "ASC" } }
  });
  if (!course) {
    const error = new Error("Course not found");
    error.status = 404;
    throw error;
  }
  return course;
}

async function getCourses(req, res, next) {
  try {
    const courses = await courseRepo.find({
      relations: ["lessons", "lessons.video"],
      order: { lessons: { order: "ASC" } }
    });
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getCourseById(req, res, next) {
  try {
    const course = await findCourseOrFail(req.params.id);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const thumbnailPath = req.file
      ? `/uploads/images/${req.file.filename}`
      : undefined;

    const newCourse = courseRepo.create({
      title,
      description,
      thumbnail: thumbnailPath,
    });
    await courseRepo.save(newCourse);
    res.status(201).json(newCourse);
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const course = await findCourseOrFail(req.params.id);

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (req.file) {
      course.thumbnail = `/uploads/images/${req.file.filename}`;
    }

    await courseRepo.save(course);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await findCourseOrFail(req.params.id);
    await courseRepo.remove(course);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
