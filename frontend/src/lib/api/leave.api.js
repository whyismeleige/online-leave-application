// src/lib/api/leave.api.js
// API functions for leave application endpoints

import { apiClient } from "./api-client";

export const leaveApi = {
  // Employee: Submit a new leave application
  applyLeave: (data) => apiClient.post("/api/leaves", data),

  // Employee: View their own leave history
  getMyLeaves: () => apiClient.get("/api/leaves/my"),

  // Get a single leave by ID
  getLeave: (id) => apiClient.get(`/api/leaves/${id}`),

  // Employee: Edit a pending leave
  updateLeave: (id, data) => apiClient.put(`/api/leaves/${id}`, data),

  // Employee: Cancel/delete a pending leave
  deleteLeave: (id) => apiClient.delete(`/api/leaves/${id}`),

  // Admin: View all leave applications (optional ?status= filter)
  getAllLeaves: (status) =>
    apiClient.get("/api/leaves", { params: status ? { status } : {} }),

  // Admin: Approve or Reject a leave
  updateLeaveStatus: (id, data) => apiClient.patch(`/api/leaves/${id}/status`, data),
};