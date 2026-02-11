// server.js
// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVER FILE — Entry point of the backend application
// Initializes Express, connects to MongoDB, and mounts all routes
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config(); // Load .env variables first

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./database/connectDB");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8080;

// ── MIDDLEWARE SETUP ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // React dev server
    credentials: true, // Required to allow cookies cross-origin
  })
);
app.use(express.json());                    // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());                    // Parse cookies from requests

// ── DATABASE ───────────────────────────────────────────────────────────────────
connectDB(); // Connect to MongoDB Atlas

// ── ROUTES ─────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const leaveRoutes = require("./routes/leave.routes");

app.use("/api/auth", authRoutes);   // Authentication: /api/auth/login, /register, etc.
app.use("/api/users", userRoutes);  // User management: /api/users (admin only)
app.use("/api/leaves", leaveRoutes); // Leave CRUD: /api/leaves

// ── HEALTH CHECK ───────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "OFF_SITE API is running",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 HANDLER ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", type: "error" });
});

// ── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────────
// Must be last middleware — catches all errors passed via next(err)
app.use(errorHandler);

// ── START SERVER ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;