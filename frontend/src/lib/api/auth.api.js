// src/lib/api/auth.api.js
// API functions for authentication endpoints

import { apiClient } from "./api-client";

export const authApi = {
  register: (data) => apiClient.post("/api/auth/register", data),
  login: (data) => apiClient.post("/api/auth/login", data),
  logout: () => apiClient.post("/api/auth/logout"),
  getProfile: () => apiClient.get("/api/auth/profile"),
};