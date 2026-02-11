// utils/auth.utils.js
// Helper functions for JWT token operations and user data sanitization

const jwt = require("jsonwebtoken");

// ── CREATE TOKEN ───────────────────────────────────────────────────────────────
// Signs a JWT token with the user's ID and role
// Token expires based on JWT_EXPIRE in .env (e.g., "7d")
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ── VERIFY TOKEN ───────────────────────────────────────────────────────────────
// Verifies and decodes a JWT token
// Returns the decoded payload or null if invalid/expired
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// ── SANITIZE USER ──────────────────────────────────────────────────────────────
// Removes sensitive fields (like password) before sending user data to frontend
// NEVER send the password hash to the client
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,           // Include role so frontend can show Admin Panel
    department: user.department,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

module.exports = { createToken, verifyToken, sanitizeUser };