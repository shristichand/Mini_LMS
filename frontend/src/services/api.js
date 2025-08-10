import axios from "axios";
import store from "../store/store";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/signup", "/login", "/refresh"];

// Request interceptor to add auth token from Redux state
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
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

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const state = store.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    const reqUrl = originalRequest?.url || "";
    const isPublicRoute = PUBLIC_ROUTES.some((r) => reqUrl.includes(r));

    // Handle 401 errors for protected routes
    if (status === 401 && !isPublicRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post("/refresh");
        const { token, user } = refreshRes.data || {};
        if (token) {
          // Update Redux auth state with new token
          store.dispatch({ 
            type: 'auth/setCredentials', 
            payload: { 
              user, 
              token, 
              permissions: user?.permissions || [] 
            } 
          });
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, will fall through to logout
        console.warn('Token refresh failed:', refreshError);
      }
      // Do not dispatch logout here; let UI handle if protected route is accessed
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication service methods
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  signup: async (userData) => {
    const response = await api.post("/signup", userData);
    return response.data;
  },

  /**
   * Authenticate user login
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Login response
   */
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get("/me");
    return response.data;
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Token refresh response
   */
  refreshToken: async () => {
    const response = await api.post("/refresh");
    return response.data;
  },
};

/**
 * Helper function to convert server file path to full URL
 * @param {string} path - Server file path
 * @returns {string} Full URL
 */
export const getFileUrl = (path) => {
  if (!path) return "";
  
  // If absolute URL, return as is
  if (/^https?:\/\//i.test(path)) return path;
  
  // Build full URL from base
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/?api\/?$/, "");
  return `${base}${path}`;
};

/**
 * Courses API service methods
 */
export const coursesService = {
  /**
   * Get all courses
   * @returns {Promise<Array>} List of courses
   */
  getCourses: async () => {
    const response = await api.get("/courses");
    return response.data;
  },

  /**
   * Get course by ID
   * @param {string|number} id - Course ID
   * @returns {Promise<Object>} Course data
   */
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create new course
   * @param {Object} courseData - Course data with optional thumbnail
   * @returns {Promise<Object>} Created course
   */
  createCourse: async ({ title, description, thumbnailFile }) => {
    const form = new FormData();
    form.append("title", title);
    if (description) form.append("description", description);
    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
    
    const response = await api.post("/courses", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update existing course
   * @param {string|number} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise<Object>} Updated course
   */
  updateCourse: async (id, { title, description, thumbnailFile }) => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (description !== undefined) form.append("description", description);
    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
    
    const response = await api.put(`/courses/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Delete course
   * @param {string|number} id - Course ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

/**
 * Lessons API service methods
 */
export const lessonsService = {
  /**
   * Get lessons for a specific course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Array>} List of lessons
   */
  getLessonsByCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
  },

  /**
   * Create new lesson
   * @param {string|number} courseId - Course ID
   * @param {Object} lessonData - Lesson data
   * @returns {Promise<Object>} Created lesson
   */
  createLesson: async (courseId, { title, order, videoFile, videoTitle, videoUrl, videoDuration }) => {
    const form = new FormData();
    form.append("title", title);
    if (order !== undefined) form.append("order", String(order));
    if (videoFile) form.append("video", videoFile);
    if (videoTitle) form.append("videoTitle", videoTitle);
    if (videoUrl) form.append("videoUrl", videoUrl);
    if (videoDuration !== undefined) form.append("videoDuration", String(videoDuration));
    
    const response = await api.post(`/courses/${courseId}/lessons`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update existing lesson
   * @param {string|number} lessonId - Lesson ID
   * @param {Object} lessonData - Updated lesson data
   * @returns {Promise<Object>} Updated lesson
   */
  updateLesson: async (lessonId, { title, order, videoFile, videoTitle, videoUrl, videoDuration }) => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (order !== undefined) form.append("order", String(order));
    if (videoFile) form.append("video", videoFile);
    if (videoTitle !== undefined) form.append("videoTitle", videoTitle);
    
    // Only append videoUrl if provided and looks like http(s)
    if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
      form.append("videoUrl", videoUrl);
    }
    
    if (videoDuration !== undefined) form.append("videoDuration", String(videoDuration));
    
    const response = await api.put(`/courses/lessons/${lessonId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Delete lesson
   * @param {string|number} lessonId - Lesson ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/courses/lessons/${lessonId}`);
    return response.data;
  },
};

/**
 * Progress tracking API service methods
 */
export const progressService = {
  /**
   * Get course progress for user
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} Course progress data
   */
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  /**
   * Get video progress for user
   * @param {string|number} videoId - Video ID
   * @returns {Promise<Object>} Video progress data
   */
  getVideoProgress: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/progress`);
    return response.data;
  },

  /**
   * Update video progress
   * @param {string|number} videoId - Video ID
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} Updated progress
   */
  updateVideoProgress: async (videoId, { watchedDuration, completed }) => {
    const response = await api.put(`/videos/${videoId}/progress`, {
      watchedDuration,
      completed,
    });
    return response.data;
  },
};

/**
 * Admin analytics API service methods
 */
export const adminService = {
  /**
   * Get users with their course progress
   * @returns {Promise<Object>} Users and progress data
   */
  getUsersWithProgress: async () => {
    const response = await api.get("/admin/users-with-progress");
    return response.data;
  },
};

export default api;
