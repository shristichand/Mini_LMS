import axios from "axios";
import store from "../store/store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token from Redux state
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    // List of public routes that don't need authentication
    const publicRoutes = ["/signup", "/login", "/refresh"];
    const isPublicRoute = publicRoutes.some((route) =>
      config.url.includes(route)
    );

    // Only add token for protected routes
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const state = store.getState();
    const isAuthenticated = state.auth.isAuthenticated;

    // List of public routes that don't need authentication
    const publicRoutes = ["/signup", "/login", "/refresh"];

    // Check if the failed request URL is public route or not
    const requestUrl = error.config?.url || "";
    const isPublicRoute = publicRoutes.some((route) =>
      requestUrl.includes(route)
    );

    if (status === 401 && isAuthenticated && !isPublicRoute) {
      // Just dispatch logout action, no direct navigation here
      store.dispatch({ type: "auth/logout" });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: async (userData) => {
    const response = await api.post("/signup", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Note: Redux state will be cleared by the logout action
  },

  getCurrentUser: async () => {
    const response = await api.get("/me");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/refresh");
    return response.data;
  },
};

// Helper to turn server relative file path (e.g. /uploads/images/xyz.jpg)
// into a full URL based on API base, stripping trailing /api
export const getFileUrl = (path) => {
  if (!path) return "";
  // If absolute URL, return as is
  if (/^https?:\/\//i.test(path)) return path;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/?api\/?$/, "");
  return `${base}${path}`;
};

// Courses API
export const coursesService = {
  getCourses: async () => {
    const res = await api.get("/courses");
    return res.data;
  },
  getCourseById: async (id) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  createCourse: async ({ title, description, thumbnailFile }) => {
    const form = new FormData();
    form.append("title", title);
    if (description) form.append("description", description);
    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
    const res = await api.post("/courses", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  updateCourse: async (id, { title, description, thumbnailFile }) => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (description !== undefined) form.append("description", description);
    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
    const res = await api.put(`/courses/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteCourse: async (id) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  },
};

// Lessons API
export const lessonsService = {
  getLessonsByCourse: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/lessons`);
    return res.data;
  },
  createLesson: async (courseId, { title, order, videoFile, videoTitle, videoUrl, videoDuration }) => {
    const form = new FormData();
    form.append("title", title);
    if (order !== undefined) form.append("order", String(order));
    if (videoFile) form.append("video", videoFile);
    if (videoTitle) form.append("videoTitle", videoTitle);
    if (videoUrl) form.append("videoUrl", videoUrl);
    if (videoDuration !== undefined) form.append("videoDuration", String(videoDuration));
    const res = await api.post(`/courses/${courseId}/lessons`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  updateLesson: async (lessonId, { title, order, videoFile, videoTitle, videoUrl, videoDuration }) => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (order !== undefined) form.append("order", String(order));
    if (videoFile) form.append("video", videoFile);
    if (videoTitle !== undefined) form.append("videoTitle", videoTitle);
    // Only append videoUrl if provided and looks like http(s)
    if (videoUrl && /^https?:\/\//i.test(videoUrl)) form.append("videoUrl", videoUrl);
    if (videoDuration !== undefined) form.append("videoDuration", String(videoDuration));
    const res = await api.put(`/courses/lessons/${lessonId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteLesson: async (lessonId) => {
    const res = await api.delete(`/courses/lessons/${lessonId}`);
    return res.data;
  },
};

// Progress API
export const progressService = {
  getCourseProgress: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/progress`);
    return res.data;
  },
  getVideoProgress: async (videoId) => {
    const res = await api.get(`/videos/${videoId}/progress`);
    return res.data;
  },
  updateVideoProgress: async (videoId, { watchedDuration, completed }) => {
    const res = await api.put(`/videos/${videoId}/progress`, {
      watchedDuration,
      completed,
    });
    return res.data;
  },
};

// Admin analytics API
export const adminService = {
  getUsersWithProgress: async () => {
    const res = await api.get("/admin/users-with-progress");
    return res.data;
  },
};

export default api;
