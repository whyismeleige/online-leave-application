// controllers/leave.controller.js
// Core CRUD for leave applications
// Employees: apply, view own, edit/delete pending
// Admins: view all, approve, reject

const db = require("../models");
const asyncHandler = require("../middleware/asyncHandler");
const { ValidationError, NotFoundError, AuthorizationError } = require("../utils/error.utils");

const Leave = db.leave;

// ── APPLY FOR LEAVE ────────────────────────────────────────────────────────────
// POST /api/leaves
// Employee: Submit a new leave request
exports.applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;

  // Validate all required fields
  if (!leaveType || !fromDate || !toDate || !reason) {
    throw new ValidationError("All fields are required: leaveType, fromDate, toDate, reason");
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // Ensure the end date is not before the start date
  if (to < from) {
    throw new ValidationError("End date cannot be before start date");
  }

  const leave = await Leave.create({
    user: req.user._id, // Automatically assigned from the logged-in user
    leaveType,
    fromDate: from,
    toDate: to,
    reason,
    status: "Pending", // Always starts as Pending
  });

  // Populate user info before sending back
  await leave.populate("user", "name email department");

  res.status(201).send({
    message: "Leave application submitted successfully",
    type: "success",
    leave,
  });
});

// ── GET MY LEAVES ──────────────────────────────────────────────────────────────
// GET /api/leaves/my
// Employee: View their own leave history
exports.getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ user: req.user._id })
    .sort({ createdAt: -1 }) // Most recent first
    .populate("user", "name email department");

  res.status(200).send({
    message: "Your leave applications fetched",
    type: "success",
    leaves,
    count: leaves.length,
  });
});

// ── GET ALL LEAVES (ADMIN) ─────────────────────────────────────────────────────
// GET /api/leaves
// Admin: View all leave applications from all employees
exports.getAllLeaves = asyncHandler(async (req, res) => {
  // Optional filter by status using query param: ?status=Pending
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const leaves = await Leave.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name email department role"); // Include user details

  res.status(200).send({
    message: "All leave applications fetched",
    type: "success",
    leaves,
    count: leaves.length,
  });
});

// ── GET SINGLE LEAVE ───────────────────────────────────────────────────────────
// GET /api/leaves/:id
// Get details of a specific leave application
exports.getLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate("user", "name email department");

  if (!leave) {
    throw new NotFoundError("Leave application not found");
  }

  // Employees can only view their own leaves
  if (req.user.role === "employee" && leave.user._id.toString() !== req.user._id.toString()) {
    throw new AuthorizationError("You are not authorized to view this leave");
  }

  res.status(200).send({
    message: "Leave fetched",
    type: "success",
    leave,
  });
});

// ── UPDATE LEAVE ───────────────────────────────────────────────────────────────
// PUT /api/leaves/:id
// Employee: Edit their own leave (only if status is still Pending)
exports.updateLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new NotFoundError("Leave application not found");
  }

  // Only the owner can edit their leave
  if (leave.user.toString() !== req.user._id.toString()) {
    throw new AuthorizationError("You are not authorized to edit this leave");
  }

  // Cannot edit once the admin has reviewed it
  if (leave.status !== "Pending") {
    throw new ValidationError("Only pending leave applications can be edited");
  }

  const { leaveType, fromDate, toDate, reason } = req.body;

  if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
    throw new ValidationError("End date cannot be before start date");
  }

  // Update only provided fields
  if (leaveType) leave.leaveType = leaveType;
  if (fromDate) leave.fromDate = new Date(fromDate);
  if (toDate) leave.toDate = new Date(toDate);
  if (reason) leave.reason = reason;

  await leave.save();
  await leave.populate("user", "name email department");

  res.status(200).send({
    message: "Leave application updated successfully",
    type: "success",
    leave,
  });
});

// ── DELETE LEAVE ───────────────────────────────────────────────────────────────
// DELETE /api/leaves/:id
// Employee: Delete their own leave (only if still Pending)
exports.deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new NotFoundError("Leave application not found");
  }

  // Only the owner can delete their leave
  if (leave.user.toString() !== req.user._id.toString()) {
    throw new AuthorizationError("You are not authorized to delete this leave");
  }

  if (leave.status !== "Pending") {
    throw new ValidationError("Only pending leave applications can be deleted");
  }

  await Leave.findByIdAndDelete(req.params.id);

  res.status(200).send({
    message: "Leave application deleted",
    type: "success",
  });
});

// ── UPDATE LEAVE STATUS (ADMIN) ────────────────────────────────────────────────
// PATCH /api/leaves/:id/status
// Admin: Approve or Reject a leave application
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  // Validate that status is one of the allowed values
  if (!status || !["Approved", "Rejected"].includes(status)) {
    throw new ValidationError("Status must be 'Approved' or 'Rejected'");
  }

  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new NotFoundError("Leave application not found");
  }

  // Update the status and optional admin note
  leave.status = status;
  leave.adminNote = adminNote || "";

  await leave.save();
  await leave.populate("user", "name email department");

  res.status(200).send({
    message: `Leave application ${status.toLowerCase()}`,
    type: "success",
    leave,
  });
});