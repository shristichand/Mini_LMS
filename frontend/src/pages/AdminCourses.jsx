import React, { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService, getFileUrl } from "../services/api";
import toast from "react-hot-toast";

const CourseForm = ({ initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.thumbnail ? getFileUrl(initial.thumbnail) : "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) {
          toast.error("Title is required");
          return;
        }
        onSubmit({ title: title.trim(), description: description.trim(), thumbnailFile });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setThumbnailFile(file);
            setPreviewUrl(file ? URL.createObjectURL(file) : "");
          }}
          className="mt-1 block w-full"
        />
        {previewUrl && (
          <div className="mt-2">
            <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200">
          Cancel
        </button>
      </div>
    </form>
  );
};

const AdminCourses = () => {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
  });

  const createMutation = useMutation({
    mutationFn: coursesService.createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to create course"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => coursesService.updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update course"),
  });
  const deleteMutation = useMutation({
    mutationFn: coursesService.deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to delete course"),
  });

  const [editingId, setEditingId] = useState(null);
  const editingCourse = useMemo(
    () => courses.find((c) => c.id === editingId),
    [courses, editingId]
  );
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Add Course
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {course.thumbnail ? (
                  <img src={getFileUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{course.title}</h3>
              {course.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditingId(course.id)}
                  className="px-3 py-1.5 rounded bg-yellow-500 text-white disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this course?")) {
                      deleteMutation.mutate(course.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
                <a href={`/admin/courses/${course.id}/lessons`} className="ml-auto px-3 py-1.5 rounded bg-slate-700 text-white">Manage Lessons</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal (simple inline) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Add Course</h2>
            <CourseForm
              onSubmit={(payload) => {
                createMutation.mutate(payload, {
                  onSuccess: () => setShowCreate(false),
                });
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Course</h2>
            <CourseForm
              initial={editingCourse}
              onSubmit={(payload) => {
                updateMutation.mutate(
                  { id: editingCourse.id, payload },
                  { onSuccess: () => setEditingId(null) }
                );
              }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;


