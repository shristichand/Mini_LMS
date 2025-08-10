import React from "react";
import LessonForm from "./LessonForm";

/**
 * Modal component for lesson forms (create/edit)
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.title - Modal title
 * @param {Object} [props.lesson] - Lesson data for editing (optional)
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel action handler
 * @returns {JSX.Element|null} Modal JSX or null if closed
 */
const LessonModal = ({ isOpen, title, lesson, onSubmit, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        {/* Modal Content */}
        <LessonForm
          initial={lesson}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

export default LessonModal;
