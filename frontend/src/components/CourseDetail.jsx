import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { coursesService, lessonsService, getFileUrl, progressService } from "../services/api";

/**
 * Video player component with progress tracking
 */
const VideoPlayer = ({ src, title, onTime, onEnded, initialTime = 0, autoPlay = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      onTime?.(Math.floor(videoElement.currentTime));
    };

    const handleEnded = () => {
      onEnded?.();
    };

    const handleLoadedMetadata = async () => {
      if (initialTime && !Number.isNaN(Number(initialTime))) {
        videoElement.currentTime = Number(initialTime);
      }

      if (autoPlay) {
        try {
          await videoElement.play();
        } catch (error) {
          console.warn('Autoplay failed:', error);
        }
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [src, initialTime, autoPlay, onTime, onEnded]);

  if (!src) return null;

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-auto rounded-lg bg-black"
      src={getFileUrl(src)}
    >
      Your browser does not support the video tag.
    </video>
  );
};

/**
 * Lesson list item component
 */
const LessonListItem = ({ lesson, index, isActive, isCompleted, onSelect }) => (
  <button
    onClick={() => onSelect(lesson.id)}
    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${
      isActive ? "bg-indigo-50" : ""
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1 text-indigo-600 font-semibold">{index + 1}.</div>
      <div>
        <div className="font-medium text-gray-900">{lesson.title}</div>
        <div className="text-xs text-gray-500">
          {lesson.video?.duration ? `${lesson.video.duration} seconds` : ""}
        </div>
      </div>
    </div>
    <input
      type="checkbox"
      checked={isCompleted}
      readOnly
      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
  </button>
);

/**
 * Main course detail component
 */
const CourseDetail = () => {
  const { id: courseId } = useParams();
  const [activeLessonId, setActiveLessonId] = useState(null);
  const queryClient = useQueryClient();

  // For throttling progress updates
  const lastUpdateRef = useRef(0);

  // Fetch course info
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
    staleTime: 60 * 1000,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => lessonsService.getLessonsByCourse(courseId),
    staleTime: 60 * 1000,
  });

  // Select active lesson
  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    const selected = lessons.find(l => l.id === activeLessonId);
    return selected || lessons[0];
  }, [lessons, activeLessonId]);

  // Fetch video progress for all lessons
  const progressQueries = useQueries({
    queries: lessons.map((lesson) => ({
      queryKey: ["videoProgress", lesson.video?.id],
      queryFn: () => progressService.getVideoProgress(lesson.video.id),
      enabled: !!lesson?.video?.id,
      staleTime: 15 * 1000,
    })),
  });

  // Map videoId => progress
  const progressByVideoId = useMemo(() => {
    const map = {};
    lessons.forEach((lesson, idx) => {
      const videoId = lesson.video?.id;
      if (!videoId) return;
      const query = progressQueries[idx];
      if (query?.data) {
        map[videoId] = query.data;
      }
    });
    return map;
  }, [lessons, progressQueries]);

  // Throttled update handler for video time updates
  const handleTimeUpdate = async (seconds) => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;

    if (seconds - lastUpdateRef.current < 5) return; // throttle for 5 seconds

    lastUpdateRef.current = seconds;

    try {
      await progressService.updateVideoProgress(videoId, {
        watchedDuration: seconds,
      });
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", Number(courseId)],
      });
    } catch (error) {
      console.warn("Failed to update video progress:", error);
    }
  };

  // Mark video as completed on end
  const handleVideoEnded = async () => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;

    try {
      await progressService.updateVideoProgress(videoId, {
        completed: true,
        watchedDuration: activeLesson?.video?.duration ?? undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["courseProgress", Number(courseId)] });
    } catch (error) {
      console.warn("Failed to mark video as completed:", error);
    }

    // Auto advance to next lesson
    if (lessons.length) {
      const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
      if (currentIndex >= 0 && currentIndex + 1 < lessons.length) {
        setActiveLessonId(lessons[currentIndex + 1].id);
      }
    }
  };

  if (isCourseLoading || isLessonsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 text-lg">Loading course...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-indigo-600 hover:underline transition-colors"
          >
            ← Back to courses
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{course?.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer
              src={activeLesson?.video?.url}
              title={activeLesson?.title}
              initialTime={progressByVideoId?.[activeLesson?.video?.id]?.watchedDuration || 0}
              onTime={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />

            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900">{activeLesson?.title}</h2>
              {activeLesson?.description && (
                <p className="text-sm text-gray-600 mt-2">{activeLesson.description}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow divide-y">
              {lessons.map((lesson, index) => {
                const isCompleted = !!progressByVideoId?.[lesson.video?.id]?.completed;
                const isActive = activeLesson?.id === lesson.id;

                return (
                  <LessonListItem
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    onSelect={setActiveLessonId}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
