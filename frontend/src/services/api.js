import axios from "axios";
import store from "../store/store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
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

export default api;
