import React from "react";

/**
 * Lesson list component displaying all lessons for a course
 * @param {Object} props - Component props
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Function} props.onEdit - Edit lesson handler
 * @param {Function} props.onDelete - Delete lesson handler
 * @param {boolean} props.isDeleting - Whether a lesson is being deleted
 * @returns {JSX.Element} Lesson list JSX
 */
const LessonList = ({ lessons, onEdit, onDelete, isDeleting }) => {
  // Handle empty state
  if (!lessons.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p className="text-lg">No lessons found.</p>
        <p className="text-sm mt-1">Add your first lesson to get started.</p>
      </div>
    );
  }

  /**
   * Handle lesson deletion with confirmation
   * @param {string|number} lessonId - Lesson ID to delete
   */
  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      onDelete(lessonId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow divide-y">
      {lessons.map((lesson, index) => (
        <LessonItem
          key={lesson.id}
          lesson={lesson}
          index={index}
          onEdit={onEdit}
          onDelete={handleDeleteLesson}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

/**
 * Individual lesson item component
 * @param {Object} props - Component props
 * @param {Object} props.lesson - Lesson data
 * @param {number} props.index - Lesson index in the list
 * @param {Function} props.onEdit - Edit lesson handler
 * @param {Function} props.onDelete - Delete lesson handler
 * @param {boolean} props.isDeleting - Whether a lesson is being deleted
 * @returns {JSX.Element} Lesson item JSX
 */
const LessonItem = ({ lesson, index, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      {/* Lesson Number */}
      <div className="text-indigo-600 font-semibold w-6">
        {index + 1}.
      </div>
      
      {/* Lesson Information */}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{lesson.title}</div>
        {lesson.video?.duration && (
          <div className="text-xs text-gray-500">
            {lesson.video.duration} seconds
          </div>
        )}
      </div>
      
      {/* Lesson Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson.id)}
          className="px-3 py-1.5 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          disabled={isDeleting}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(lesson.id)}
          className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default LessonList;
