// controllers/user.controller.js
// Admin-only CRUD operations for managing users in the system

const db = require("../models");
const asyncHandler = require("../middleware/asyncHandler");
const { ValidationError, NotFoundError } = require("../utils/error.utils");
const { sanitizeUser } = require("../utils/auth.utils");

const User = db.user;

// ── GET ALL USERS ──────────────────────────────────────────────────────────────
// GET /api/users
// Admin only: Returns a list of all registered users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }); // Newest first

  res.status(200).send({
    message: "Users fetched",
    type: "success",
    users: users.map(sanitizeUser),
    count: users.length,
  });
});

// ── GET SINGLE USER ────────────────────────────────────────────────────────────
// GET /api/users/:id
// Admin only: Returns a single user by ID
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).send({
    message: "User fetched",
    type: "success",
    user: sanitizeUser(user),
  });
});

// ── UPDATE USER ────────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Admin only: Updates user details (name, department, role)
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, department, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Only update fields that were actually sent
  if (name) user.name = name;
  if (department) user.department = department;
  if (role && ["admin", "employee"].includes(role)) user.role = role;

  await user.save();

  res.status(200).send({
    message: "User updated successfully",
    type: "success",
    user: sanitizeUser(user),
  });
});

// ── DELETE USER ────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// Admin only: Removes a user from the system
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError("You cannot delete your own account");
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).send({
    message: "User deleted successfully",
    type: "success",
  });
});