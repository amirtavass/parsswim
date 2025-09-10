// lib/api.js
import axios from "axios";

// Dynamic API URL detection
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000";
    } else {
      return "https://parsswim-backend-production.up.railway.app";
    }
  } else {
    // Server-side fallback
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }
};

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // CRITICAL: Always send cookies
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't log expected authentication errors
    const silentEndpoints = ["/admin/me", "/auth/me"];
    const isAuthCheck = silentEndpoints.some((endpoint) =>
      error.config?.url?.includes(endpoint)
    );

    if (!isAuthCheck || error.response?.status !== 401) {
      console.error(
        `API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        error.response?.data || error.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;
