import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminLessons } from "../hooks/useAdminLessons";
import LessonList from "../components/admin/LessonList";
import LessonModal from "../components/admin/LessonModal";

/**
 * Admin lessons component for managing lessons within a specific course
 * @returns {JSX.Element} Admin lessons JSX
 */
const AdminLessons = () => {
  const { id: courseId } = useParams();
  const {
    course,
    lessons,
    isLessonsLoading,
    createLesson,
    updateLesson,
    deleteLesson,
    isDeleting,
  } = useAdminLessons(courseId);

  // State management
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Memoized editing lesson
  const editingLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === editingId),
    [lessons, editingId]
  );

  /**
   * Handle lesson creation
   * @param {Object} payload - Lesson data to create
   */
  const handleCreateLesson = (payload) => {
    createLesson(payload, {
      onSuccess: () => setShowCreate(false),
    });
  };

  /**
   * Handle lesson update
   * @param {Object} payload - Updated lesson data
   */
  const handleUpdateLesson = (payload) => {
    updateLesson(
      { lessonId: editingId, payload },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <div className="py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
          <div className="text-sm text-gray-600">
            Course: {course?.title || 'Loading...'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/courses" 
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Back to Courses
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Add Lesson
          </button>
        </div>
      </div>

      {/* Content Section */}
      {isLessonsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 text-lg">Loading lessons...</div>
        </div>
      ) : (
        <LessonList
          lessons={lessons}
          onEdit={setEditingId}
          onDelete={deleteLesson}
          isDeleting={isDeleting}
        />
      )}

      {/* Create Lesson Modal */}
      <LessonModal
        isOpen={showCreate}
        title="Add Lesson"
        onSubmit={handleCreateLesson}
        onCancel={() => setShowCreate(false)}
      />

      {/* Edit Lesson Modal */}
      <LessonModal
        isOpen={!!editingLesson}
        title="Edit Lesson"
        lesson={editingLesson}
        onSubmit={handleUpdateLesson}
        onCancel={() => setEditingId(null)}
      />
    </div>
  );
};

export default AdminLessons;


