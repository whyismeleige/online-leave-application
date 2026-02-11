// src/lib/api/user.api.js
// API functions for user management endpoints (admin only)

import { apiClient } from "./api-client";

export const userApi = {
  // Admin: Get all registered users
  getAllUsers: () => apiClient.get("/api/users"),

  // Admin: Get a specific user
  getUser: (id) => apiClient.get(`/api/users/${id}`),

  // Admin: Update user details
  updateUser: (id, data) => apiClient.put(`/api/users/${id}`, data),

  // Admin: Remove a user
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
};