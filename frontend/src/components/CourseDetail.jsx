import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { coursesService, lessonsService, getFileUrl } from "../services/api";

const VideoPlayer = ({ src, title }) => {
  if (!src) return null;
  return (
    <video
      controls
      className="w-full h-auto rounded-lg bg-black"
      src={getFileUrl(src)}
    >
      Your browser does not support the video tag.
    </video>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const [activeLessonId, setActiveLessonId] = useState(null);

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
            <VideoPlayer src={activeLesson?.video?.url} title={activeLesson?.title} />
            <div className="mt-3">
              <h2 className="text-lg font-semibold text-gray-900">{activeLesson?.title}</h2>
              {activeLesson?.description && (
                <p className="text-sm text-gray-600 mt-1">{activeLesson.description}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow divide-y">
              {lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    activeLesson?.id === lesson.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1 text-indigo-600 font-semibold">
                      {idx + 1}.
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{lesson.title}</div>
                      {lesson.video?.duration ? (
                        <div className="text-xs text-gray-500">{lesson.video.duration} sec</div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;


