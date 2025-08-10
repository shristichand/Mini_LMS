import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { coursesService, lessonsService, getFileUrl, progressService } from "../services/api";

/**
 * Video player component with progress tracking
 * @param {Object} props - Component props
 * @param {string} props.src - Video source URL
 * @param {string} props.title - Video title
 * @param {Function} props.onTime - Time update callback
 * @param {Function} props.onEnded - Video ended callback
 * @param {number} [props.initialTime=0] - Initial playback time
 * @param {boolean} [props.autoPlay=true] - Whether to autoplay video
 * @returns {JSX.Element|null} Video player JSX or null if no source
 */
const VideoPlayer = ({ src, title, onTime, onEnded, initialTime = 0, autoPlay = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    /**
     * Handle time updates and notify parent
     */
    const handleTimeUpdate = () => {
      onTime?.(Math.floor(videoElement.currentTime));
    };

    /**
     * Handle video completion
     */
    const handleEnded = () => {
      onEnded?.();
    };

    /**
     * Handle video metadata loaded
     */
    const handleLoadedMetadata = async () => {
      // Set initial time if provided
      if (initialTime && !Number.isNaN(Number(initialTime))) {
        videoElement.currentTime = Number(initialTime);
      }

      // Autoplay if enabled
      if (autoPlay) {
        try {
          await videoElement.play();
        } catch (error) {
          // Autoplay may fail due to browser policies
          console.warn('Autoplay failed:', error);
        }
      }
    };

    // Add event listeners
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Cleanup event listeners
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
 * Lesson list item component for the sidebar
 * @param {Object} props - Component props
 * @param {Object} props.lesson - Lesson data
 * @param {number} props.index - Lesson index
 * @param {boolean} props.isActive - Whether lesson is currently active
 * @param {boolean} props.isCompleted - Whether lesson is completed
 * @param {Function} props.onSelect - Lesson selection handler
 * @returns {JSX.Element} Lesson list item JSX
 */
const LessonListItem = ({ lesson, index, isActive, isCompleted, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(lesson.id)}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${
        isActive ? "bg-indigo-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1 text-indigo-600 font-semibold">
          {index + 1}.
        </div>
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
};

/**
 * Main course detail component displaying video player and lesson list
 * @returns {JSX.Element} Course detail JSX
 */
const CourseDetail = () => {
  const { id: courseId } = useParams();
  const [activeLessonId, setActiveLessonId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch course data
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch lessons for the course
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => lessonsService.getLessonsByCourse(courseId),
    staleTime: 60 * 1000, // 1 minute
  });

  // Determine active lesson (selected or first)
  const activeLesson = useMemo(() => {
    if (!lessons?.length) return null;
    const firstLesson = lessons[0];
    const selectedLesson = lessons.find((lesson) => lesson.id === activeLessonId);
    return selectedLesson || firstLesson;
  }, [lessons, activeLessonId]);

  // Fetch progress for all lesson videos
  const progressQueries = useQueries({
    queries: (lessons || []).map((lesson) => ({
      queryKey: ["videoProgress", lesson.video?.id],
      queryFn: () => progressService.getVideoProgress(lesson.video.id),
      enabled: !!lesson?.video?.id,
      staleTime: 15 * 1000, // 15 seconds
    })),
  });

  // Create progress lookup map
  const progressByVideoId = useMemo(() => {
    const progressMap = {};
    (lessons || []).forEach((lesson, index) => {
      const videoId = lesson.video?.id;
      if (!videoId) return;
      const query = progressQueries[index];
      if (query?.data) {
        progressMap[videoId] = query.data;
      }
    });
    return progressMap;
  }, [lessons, progressQueries]);

  /**
   * Handle video time updates (throttled to every 5 seconds)
   * @param {number} seconds - Current playback time
   */
  const handleTimeUpdate = async (seconds) => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;

    // Throttle updates to every 5 seconds
    if (seconds % 5 !== 0) return;

    try {
      await progressService.updateVideoProgress(videoId, {
        watchedDuration: seconds,
      });
      // Refresh course progress on dashboard
      queryClient.invalidateQueries({ queryKey: ["courseProgress", Number(courseId)] });
    } catch (error) {
      console.warn('Failed to update video progress:', error);
    }
  };

  /**
   * Handle video completion
   */
  const handleVideoEnded = async () => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;

    try {
      await progressService.updateVideoProgress(videoId, {
        completed: true,
        watchedDuration: activeLesson?.video?.duration ?? undefined,
      });
      // Refresh course progress
      queryClient.invalidateQueries({ queryKey: ["courseProgress", Number(courseId)] });
    } catch (error) {
      console.warn('Failed to mark video as completed:', error);
    }

    // Auto-advance to next lesson if available
    if (lessons?.length) {
      const currentIndex = lessons.findIndex((lesson) => lesson.id === activeLesson?.id);
      if (currentIndex >= 0 && currentIndex + 1 < lessons.length) {
        setActiveLessonId(lessons[currentIndex + 1].id);
      }
    }
  };

  // Loading state
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
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="text-sm text-indigo-600 hover:underline transition-colors"
          >
            ← Back to courses
          </Link>
        </div>

        {/* Course Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{course?.title}</h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <VideoPlayer
              src={activeLesson?.video?.url}
              title={activeLesson?.title}
              initialTime={progressByVideoId?.[activeLesson?.video?.id]?.watchedDuration || 0}
              onTime={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
            
            {/* Lesson Information */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900">{activeLesson?.title}</h2>
              {activeLesson?.description && (
                <p className="text-sm text-gray-600 mt-2">{activeLesson.description}</p>
              )}
            </div>
          </div>

          {/* Lesson List Sidebar */}
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


