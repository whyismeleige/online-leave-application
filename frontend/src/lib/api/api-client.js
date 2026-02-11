// src/lib/api/api-client.js
// Centralized Axios instance used by all API calls
// Includes response interceptor for consistent error toast notifications

import axios from "axios";
import toast from "react-hot-toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true, // Required to send/receive cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────────
// Runs on every API response
// On error: shows a toast notification (except for silent background checks)
apiClient.interceptors.response.use(
  // Success: pass through unchanged
  (response) => response,

  // Error: show toast then reject
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    // Silently fail for the initial profile check (user might just not be logged in)
    const isProfileCheck = error.config?.url?.includes("/auth/profile");
    if (error.response?.status === 401 && isProfileCheck) {
      return Promise.reject(error);
    }

    // Show the error message from the server as a toast
    toast.error(message);
    return Promise.reject(error);
  }
);