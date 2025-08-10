import React, { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService, getFileUrl } from "../services/api";
import toast from "react-hot-toast";

/**
 * Course form component for creating and editing courses
 * @param {Object} props - Component props
 * @param {Object} [props.initial] - Initial course data for editing
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel action handler
 * @returns {JSX.Element} Course form JSX
 */
const CourseForm = ({ initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(
    initial?.thumbnail ? getFileUrl(initial.thumbnail) : ""
  );

  /**
   * Handle form submission with validation
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSubmit({ 
      title: title.trim(), 
      description: description.trim(), 
      thumbnailFile 
    });
  };

  /**
   * Handle file selection and preview
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Thumbnail Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mt-1 block w-full"
        />
        {previewUrl && (
          <div className="mt-2">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full max-h-48 object-cover rounded" 
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button 
          type="submit" 
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/**
 * Course card component displaying course information and actions
 * @param {Object} props - Component props
 * @param {Object} props.course - Course data
 * @param {Function} props.onEdit - Edit course handler
 * @param {Function} props.onDelete - Delete course handler
 * @param {boolean} props.isDeleting - Whether course is being deleted
 * @returns {JSX.Element} Course card JSX
 */
const CourseCard = ({ course, onEdit, onDelete, isDeleting }) => {
  const thumbnailUrl = course.thumbnail ? getFileUrl(course.thumbnail) : null;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition-shadow">
      {/* Course Thumbnail */}
      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Course Information */}
      <h3 className="mt-3 font-semibold text-gray-900">{course.title}</h3>
      {course.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
      )}

      {/* Course Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(course.id)}
          className="px-3 py-1.5 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          disabled={isDeleting}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(course.id)}
          className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          disabled={isDeleting}
        >
          Delete
        </button>
        <a 
          href={`/admin/courses/${course.id}/lessons`} 
          className="ml-auto px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-800 transition-colors"
        >
          Manage Lessons
        </a>
      </div>
    </div>
  );
};

/**
 * Modal component for course forms
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {Function} props.onClose - Close modal handler
 * @returns {JSX.Element|null} Modal JSX or null if closed
 */
const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

/**
 * Main admin courses component for managing courses
 * @returns {JSX.Element} Admin courses JSX
 */
const AdminCourses = () => {
  const queryClient = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
    staleTime: 60 * 1000, // 1 minute
  });

  // State management
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Memoized editing course
  const editingCourse = useMemo(
    () => courses.find((course) => course.id === editingId),
    [courses, editingId]
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: coursesService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
      setShowCreate(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to create course";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => coursesService.updateCourse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
      setEditingId(null);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to update course";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursesService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to delete course";
      toast.error(errorMessage);
    },
  });

  /**
   * Handle course deletion with confirmation
   * @param {string|number} courseId - Course ID to delete
   */
  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  return (
    <div className="py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Add Course
        </button>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 text-lg">Loading courses...</div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={setEditingId}
              onDelete={handleDeleteCourse}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreate}
        title="Add Course"
        onClose={() => setShowCreate(false)}
      >
        <CourseForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={!!editingCourse}
        title="Edit Course"
        onClose={() => setEditingId(null)}
      >
        <CourseForm
          initial={editingCourse}
          onSubmit={(payload) => {
            updateMutation.mutate({
              id: editingCourse.id,
              payload
            });
          }}
          onCancel={() => setEditingId(null)}
        />
      </Modal>
    </div>
  );
};

export default AdminCourses;


