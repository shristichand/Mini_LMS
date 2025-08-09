import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService, lessonsService } from "../services/api";
import toast from "react-hot-toast";

const LessonForm = ({ initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState(initial?.video?.title || "");
  const [videoUrl, setVideoUrl] = useState(initial?.video?.url || "");
  const [videoDuration, setVideoDuration] = useState(initial?.video?.duration || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) {
          toast.error("Title is required");
          return;
        }
        const payload = { title: title.trim(), order };
        if (videoTitle) payload.videoTitle = videoTitle;
        // Only send duration if provided and numeric
        if (videoDuration !== "" && !Number.isNaN(Number(videoDuration))) {
          payload.videoDuration = Number(videoDuration);
        }
        if (videoFile) {
          payload.videoFile = videoFile;
        } else if (videoUrl && /^(https?:)\/\//i.test(videoUrl)) {
          // Only send URL if it's absolute http(s)
          payload.videoUrl = videoUrl.trim();
        }
        onSubmit(payload);
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
        <label className="block text-sm font-medium text-gray-700">Order</label>
        <input
          type="number"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value || 0, 10))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Video</label>
          <input type="file" accept="video/*" className="mt-1 block w-full" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Or Video URL (http/https)</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Video Title</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (sec)</label>
          <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
      </div>
    </form>
  );
};

const AdminLessons = () => {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesService.getCourseById(id),
  });

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => lessonsService.getLessonsByCourse(id),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => lessonsService.createLesson(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons", id] });
      toast.success("Lesson created");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to create lesson"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }) => lessonsService.updateLesson(lessonId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons", id] });
      toast.success("Lesson updated");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update lesson"),
  });
  const deleteMutation = useMutation({
    mutationFn: (lessonId) => lessonsService.deleteLesson(lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons", id] });
      toast.success("Lesson deleted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to delete lesson"),
  });

  const [editingId, setEditingId] = useState(null);
  const editingLesson = useMemo(
    () => lessons.find((l) => l.id === editingId),
    [lessons, editingId]
  );
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
          <div className="text-sm text-gray-600">Course: {course?.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/courses" className="px-3 py-2 rounded bg-gray-200">Back</Link>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded bg-indigo-600 text-white">Add Lesson</button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="p-4 flex items-center gap-4">
              <div className="text-indigo-600 font-semibold w-6">{idx + 1}.</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{lesson.title}</div>
                {lesson.video?.duration ? (
                  <div className="text-xs text-gray-500">{lesson.video.duration} sec</div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(lesson.id)} className="px-3 py-1.5 rounded bg-yellow-500 text-white disabled:opacity-50" disabled={deleteMutation.isPending}>Edit</button>
                <button onClick={() => { if (window.confirm('Delete this lesson?')) deleteMutation.mutate(lesson.id); }} className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50" disabled={deleteMutation.isPending}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Add Lesson</h2>
            <LessonForm
              onSubmit={(payload) => {
                createMutation.mutate(payload, { onSuccess: () => setShowCreate(false) });
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      {/* Edit */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Edit Lesson</h2>
            <LessonForm
              initial={editingLesson}
              onSubmit={(payload) => {
                updateMutation.mutate(
                  { lessonId: editingLesson.id, payload },
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

export default AdminLessons;


