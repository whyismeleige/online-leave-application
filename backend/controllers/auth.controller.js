// controllers/auth.controller.js
// Handles user registration, login, logout and profile retrieval
// All functions use asyncHandler so errors are auto-forwarded to errorHandler

const db = require("../models");
const asyncHandler = require("../middleware/asyncHandler");
const { ValidationError, NotFoundError, AuthenticationError } = require("../utils/error.utils");
const { createToken, sanitizeUser } = require("../utils/auth.utils");

const User = db.user;

// ── COOKIE OPTIONS ─────────────────────────────────────────────────────────────
// Settings for the JWT cookie sent to the browser
// httpOnly prevents JavaScript access → protects against XSS attacks
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

// ── REGISTER ───────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account and logs them in immediately
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, department, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError("Name, email and password are required");
  }

  // Check if user with this email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ValidationError("An account with this email already exists");
  }

  // Create the user (password is hashed automatically by the pre-save hook)
  const newUser = await User.create({
    email,
    name,
    password,
    department: department || "General",
    // Only allow role assignment in development — in production, default to employee
    role: process.env.NODE_ENV === "development" ? (role || "employee") : "employee",
  });

  // Create JWT token containing the user's ID
  const token = createToken({ id: newUser._id });

  // Send token as an HTTP-only cookie (more secure than localStorage)
  res.cookie("token", token, getCookieOptions());

  res.status(201).send({
    message: "Account created successfully",
    type: "success",
    user: sanitizeUser(newUser),
  });
});

// ── LOGIN ──────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Verifies credentials and issues a JWT cookie
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  // Find user and explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new NotFoundError("No account found with this email");
  }

  // Compare provided password with stored hash
  const passwordsMatch = await user.passwordsMatch(password);
  if (!passwordsMatch) {
    throw new AuthenticationError("Incorrect password");
  }

  const token = createToken({ id: user._id });
  res.cookie("token", token, getCookieOptions());

  res.status(200).send({
    message: "Logged in successfully",
    type: "success",
    user: sanitizeUser(user),
  });
});

// ── LOGOUT ─────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Clears the JWT cookie from the browser
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).send({
    message: "Logged out successfully",
    type: "success",
  });
});

// ── GET PROFILE ────────────────────────────────────────────────────────────────
// GET /api/auth/profile
// Returns the logged-in user's profile (req.user is set by authenticateToken middleware)
exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).send({
    message: "Profile fetched",
    type: "success",
    user: sanitizeUser(req.user),
  });
});