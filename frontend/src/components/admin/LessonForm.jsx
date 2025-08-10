import React, { useState } from "react";
import toast from "react-hot-toast";

/**
 * Lesson form component for creating and editing lessons
 * @param {Object} props - Component props
 * @param {Object} [props.initial] - Initial lesson data for editing
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel action handler
 * @returns {JSX.Element} Lesson form JSX
 */
const LessonForm = ({ initial, onSubmit, onCancel }) => {
  // Form state
  const [title, setTitle] = useState(initial?.title || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState(initial?.video?.title || "");
  const [videoUrl, setVideoUrl] = useState(initial?.video?.url || "");
  const [videoDuration, setVideoDuration] = useState(initial?.video?.duration || "");

  /**
   * Handle form submission with validation
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Build payload with basic fields
    const payload = { 
      title: title.trim(), 
      order: parseInt(order, 10) || 0
    };
    
    // Add optional video fields if provided
    if (videoTitle.trim()) {
      payload.videoTitle = videoTitle.trim();
    }
    
    // Only send duration if provided and numeric
    if (videoDuration !== "" && !Number.isNaN(Number(videoDuration))) {
      payload.videoDuration = Number(videoDuration);
    }
    
    // Handle video input (file takes precedence over URL)
    if (videoFile) {
      payload.videoFile = videoFile;
    } else if (videoUrl.trim() && /^(https?:)\/\//i.test(videoUrl.trim())) {
      // Only send URL if it's absolute http(s)
      payload.videoUrl = videoUrl.trim();
    }
    
    onSubmit(payload);
  };

  /**
   * Handle order input change with validation
   * @param {Event} e - Input change event
   */
  const handleOrderChange = (e) => {
    const value = parseInt(e.target.value || 0, 10);
    setOrder(isNaN(value) ? 0 : Math.max(0, value));
  };

  /**
   * Handle duration input change with validation
   * @param {Event} e - Input change event
   */
  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setVideoDuration(value);
    }
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
      
      {/* Order Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Order</label>
        <input
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={order}
          onChange={handleOrderChange}
        />
      </div>
      
      {/* Video Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            className="mt-1 block w-full"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </div>
        {/* Video URL field commented out as per original file */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Or Video URL (http/https)</label>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div> */}
      </div>
      
      {/* Video Metadata Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Video Title</label>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Optional video title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
          <input
            type="number"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={videoDuration}
            onChange={handleDurationChange}
            placeholder="Optional duration"
          />
        </div>
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

export default LessonForm;
