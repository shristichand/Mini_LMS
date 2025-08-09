import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { coursesService, lessonsService, getFileUrl, progressService } from "../services/api";

const VideoPlayer = ({ src, title, onTime, onEnded, initialTime = 0, autoPlay = true }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Prepare handlers
    const handleTime = () => onTime?.(Math.floor(el.currentTime));
    const handleEnded = () => onEnded?.();
    const handleLoaded = async () => {
      if (initialTime && !Number.isNaN(Number(initialTime))) {
        el.currentTime = Number(initialTime);
      }
      if (autoPlay) {
        try {
          await el.play();
        } catch (_) {}
      }
    };
    el.addEventListener("timeupdate", handleTime);
    el.addEventListener("ended", handleEnded);
    el.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      el.removeEventListener("timeupdate", handleTime);
      el.removeEventListener("ended", handleEnded);
    el.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [src, initialTime, autoPlay, onTime, onEnded]);

  if (!src) return null;
  return (
    <video ref={videoRef} controls className="w-full h-auto rounded-lg bg-black" src={getFileUrl(src)}>
      Your browser does not support the video tag.
    </video>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const [activeLessonId, setActiveLessonId] = useState(null);

  const queryClient = useQueryClient();
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesService.getCourseById(id),
  });

  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => lessonsService.getLessonsByCourse(id),
  });

  const activeLesson = useMemo(() => {
    if (!lessons?.length) return null;
    const first = lessons[0];
    const found = lessons.find((l) => l.id === activeLessonId);
    return found || first;
  }, [lessons, activeLessonId]);

  // Fetch progress for all lesson videos so we can render checkboxes
  const progressQueries = useQueries({
    queries: (lessons || []).map((l) => ({
      queryKey: ["videoProgress", l.video?.id],
      queryFn: () => progressService.getVideoProgress(l.video.id),
      enabled: !!l?.video?.id,
      staleTime: 15 * 1000,
    })),
  });

  const progressByVideoId = useMemo(() => {
    const map = {};
    (lessons || []).forEach((l, idx) => {
      const vid = l.video?.id;
      if (!vid) return;
      const q = progressQueries[idx];
      if (q?.data) map[vid] = q.data;
    });
    return map;
  }, [lessons, progressQueries]);

  const handleTimeUpdate = async (seconds) => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;
    // Throttle by sending only every ~5 seconds of change via simple modulo
    if (seconds % 5 !== 0) return;
    try {
      await progressService.updateVideoProgress(videoId, {
        watchedDuration: seconds,
      });
      // Also refresh course progress bar on dashboard if user navigates back
      queryClient.invalidateQueries({ queryKey: ["courseProgress", Number(id)] });
    } catch (_) {}
  };

  const handleEnded = async () => {
    const videoId = activeLesson?.video?.id;
    if (!videoId) return;
    try {
      await progressService.updateVideoProgress(videoId, {
        completed: true,
        watchedDuration: activeLesson?.video?.duration ?? undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["courseProgress", Number(id)] });
    } catch (_) {}

    // Autoplay next lesson if available
    if (lessons?.length) {
      const idx = lessons.findIndex((l) => l.id === activeLesson?.id);
      if (idx >= 0 && idx + 1 < lessons.length) {
        setActiveLessonId(lessons[idx + 1].id);
      }
    }
  };

  if (isCourseLoading || isLessonsLoading) {
    return <div className="max-w-7xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Back to courses
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{course?.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer
              src={activeLesson?.video?.url}
              title={activeLesson?.title}
              initialTime={progressByVideoId?.[activeLesson?.video?.id]?.watchedDuration || 0}
              onTime={handleTimeUpdate}
              onEnded={handleEnded}
            />
            <div className="mt-3">
              <h2 className="text-lg font-semibold text-gray-900">{activeLesson?.title}</h2>
              {activeLesson?.description && (
                <p className="text-sm text-gray-600 mt-1">{activeLesson.description}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow divide-y">
              {lessons.map((lesson, idx) => {
                const completed = !!progressByVideoId?.[lesson.video?.id]?.completed;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition flex items-center justify-between ${
                      activeLesson?.id === lesson.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-indigo-600 font-semibold">
                        {idx + 1}.
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-xs text-gray-500">
                          {lesson.video?.duration ? `${lesson.video.duration} sec` : ""}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={completed}
                      readOnly
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </button>
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


