const Connection = require("../database/data-source");
const Progress = require("../database/entities/Progress");
const Video = require("../database/entities/Video");
const Lesson = require("../database/entities/Lesson");
const Course = require("../database/entities/Course");
const { In } = require("typeorm");

const progressRepo = Connection.getRepository(Progress);
const videoRepo = Connection.getRepository(Video);
const lessonRepo = Connection.getRepository(Lesson);
const courseRepo = Connection.getRepository(Course);

// Get aggregated progress for a course for current user
async function getCourseProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Fetch all lessons in the course (video is eager on Lesson)
    const lessons = await lessonRepo.find({
      where: { course: { id: courseId } },
      order: { order: "ASC" },
    });

    const totalLessons = lessons.length;
    if (totalLessons === 0) {
      return res.json({
        courseId: Number(courseId),
        totalLessons: 0,
        completedLessons: 0,
        watchedLessons: 0,
        percentageCompleted: 0,
      });
    }

    const videoIds = lessons
      .map((l) => l.video?.id)
      .filter((id) => typeof id === "number");

    if (videoIds.length === 0) {
      return res.json({
        courseId: Number(courseId),
        totalLessons,
        completedLessons: 0,
        watchedLessons: 0,
        percentageCompleted: 0,
      });
    }

    const progressList = await progressRepo.find({
      where: { user: { id: userId }, video: { id: In(videoIds) } },
    });

    const completedLessons = progressList.filter((p) => p.completed).length;
    const watchedLessons = progressList.filter((p) => (p.watchedDuration ?? 0) > 0).length;
    const percentageCompleted = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return res.json({
      courseId: Number(courseId),
      totalLessons,
      completedLessons,
      watchedLessons,
      percentageCompleted,
    });
  } catch (err) {
    next(err);
  }
}

// Update progress for a video
async function updateProgress(req, res, next) {
  try {
    const { watchedDuration, completed } = req.body;
    const { videoId } = req.params;
    const userId = req.user.id; // assuming JWT middleware sets req.user

    const video = await videoRepo.findOne({ where: { id: videoId } });
    if (!video) return res.status(404).json({ message: "Video not found" });

    let progress = await progressRepo.findOne({
      where: { video: { id: videoId }, user: { id: userId } },
      relations: ["video", "user"]
    });

    if (!progress) {
      progress = progressRepo.create({
        video,
        user: { id: userId },
        watchedDuration,
        completed
      });
    } else {
      if (watchedDuration !== undefined) progress.watchedDuration = watchedDuration;
      if (completed !== undefined) progress.completed = completed;
    }

    await progressRepo.save(progress);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

// Get progress for a video
async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const progress = await progressRepo.findOne({
      where: { video: { id: videoId }, user: { id: userId } },
      relations: ["video"]
    });

    res.json(progress || { watchedDuration: 0, completed: false });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateProgress,
  getProgress,
  getCourseProgress,
};
