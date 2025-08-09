const Connection = require("../database/data-source");
const { validationResult } = require("express-validator");
const Lesson = require("../database/entities/Lesson");
const Course = require("../database/entities/Course");
const Video = require("../database/entities/Video");

const lessonRepo = Connection.getRepository(Lesson);
const courseRepo = Connection.getRepository(Course);
const videoRepo = Connection.getRepository(Video);

// Create Lesson + Video
async function createLesson(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, order, videoTitle, videoUrl, videoDuration } = req.body;
    const { courseId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    const course = await courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Determine video URL and duration
    let resolvedVideoUrl = videoUrl;
    let resolvedDuration = videoDuration;
    if (req.file) {
      resolvedVideoUrl = `/uploads/videos/${req.file.filename}`;
      // If client didn't send duration, default to 0; clients can update later
      if (!resolvedDuration) {
        resolvedDuration = 0;
      }
    }

    const video = videoRepo.create({
      title: videoTitle || title,
      url: resolvedVideoUrl,
      duration: resolvedDuration,
      course
    });

    const lesson = lessonRepo.create({
      title,
      order,
      course,
      video
    });

    await lessonRepo.save(lesson);

    res.status(201).json({
      message: "Lesson with video created successfully",
      lesson
    });
  } catch (err) {
    next(err);
  }
}

// Get lessons for a course
async function getLessonsByCourse(req, res, next) {
  try {
    const lessons = await lessonRepo.find({
      where: { course: { id: req.params.courseId } },
      relations: ["video"],
      order: { order: "ASC" }
    });
    res.json(lessons);
  } catch (err) {
    next(err);
  }
}

// Update lesson & video
async function updateLesson(req, res, next) {
  try {
    const lesson = await lessonRepo.findOne({
      where: { id: req.params.lessonId },
      relations: ["video"]
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const { title, order, videoTitle, videoUrl, videoDuration } = req.body;

    if (title !== undefined) lesson.title = title;
    if (order !== undefined) lesson.order = order;
    if (lesson.video) {
      if (videoTitle !== undefined) lesson.video.title = videoTitle;
      if (req.file) {
        lesson.video.url = `/uploads/videos/${req.file.filename}`;
      } else if (videoUrl !== undefined) {
        lesson.video.url = videoUrl;
      }
      if (videoDuration !== undefined) lesson.video.duration = videoDuration;
    }

    await lessonRepo.save(lesson);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

// Delete lesson (video will cascade if configured)
async function deleteLesson(req, res, next) {
  try {
    const lesson = await lessonRepo.findOne({ where: { id: req.params.lessonId } });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await lessonRepo.remove(lesson);

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  createLesson,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
};
