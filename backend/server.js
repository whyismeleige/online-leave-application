// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// 1. MongoDB Connection
// ==========================================
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.log("Connection Error", error);
    process.exit(1);
  }
}

connectDB();

// ==========================================
// 2. Global Middleware
// ==========================================
// Make db available globally
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// 3. Helper Functions & Auth Middleware
// ==========================================
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const users = req.db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// ==========================================
// 4. Auth Routes (/api/auth)
// ==========================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    const users = req.db.collection("users");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const userExists = await users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      department: department || "General",
      role: process.env.NODE_ENV === "development" ? (role || "employee") : "employee",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    const user = await users.findOne({ _id: result.insertedId });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, getCookieOptions());

    delete user.password;
    res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = req.db.collection("users");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, getCookieOptions());

    delete user.password;
    res.json({
      message: "Logged in successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/profile", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const users = req.db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    delete user.password;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. Leave Routes (/api/leaves)
// ==========================================

// Apply for leave
app.post("/api/leaves", authenticateToken, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const leaves = req.db.collection("leaves");

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) {
      return res.status(400).json({ error: "End date cannot be before start date" });
    }

    const leave = {
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userDepartment: req.user.department,
      leaveType,
      fromDate: from,
      toDate: to,
      reason,
      status: "Pending",
      adminNote: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await leaves.insertOne(leave);
    const insertedLeave = await leaves.findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave: insertedLeave,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my leaves
app.get("/api/leaves/my", authenticateToken, async (req, res) => {
  try {
    const leaves = req.db.collection("leaves");
    const myLeaves = await leaves
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    const leavesWithDays = myLeaves.map(leave => {
      const diff = leave.toDate.getTime() - leave.fromDate.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      return { ...leave, numberOfDays: days };
    });

    res.json({ leaves: leavesWithDays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leaves (admin only)
app.get("/api/leaves", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access forbidden" });
    }

    const leaves = req.db.collection("leaves");
    const allLeaves = await leaves.find().sort({ createdAt: -1 }).toArray();

    const leavesWithDays = allLeaves.map(leave => {
      const diff = leave.toDate.getTime() - leave.fromDate.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      return { ...leave, numberOfDays: days };
    });

    res.json({ leaves: leavesWithDays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single leave
app.get("/api/leaves/:id", authenticateToken, async (req, res) => {
  try {
    const leaves = req.db.collection("leaves");
    const leave = await leaves.findOne({ _id: new ObjectId(req.params.id) });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    if (leave.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access forbidden" });
    }

    const diff = leave.toDate.getTime() - leave.fromDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    leave.numberOfDays = days;

    res.json({ leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leave
app.put("/api/leaves/:id", authenticateToken, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const leaves = req.db.collection("leaves");
    const leave = await leaves.findOne({ _id: new ObjectId(req.params.id) });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access forbidden" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ error: "Only pending leaves can be edited" });
    }

    const updates = {};
    if (leaveType) updates.leaveType = leaveType;
    if (fromDate) updates.fromDate = new Date(fromDate);
    if (toDate) updates.toDate = new Date(toDate);
    if (reason) updates.reason = reason;
    updates.updatedAt = new Date();

    await leaves.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    const updatedLeave = await leaves.findOne({ _id: new ObjectId(req.params.id) });

    res.json({
      message: "Leave updated successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete leave
app.delete("/api/leaves/:id", authenticateToken, async (req, res) => {
  try {
    const leaves = req.db.collection("leaves");
    const leave = await leaves.findOne({ _id: new ObjectId(req.params.id) });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access forbidden" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ error: "Only pending leaves can be deleted" });
    }

    await leaves.deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leave status (admin only)
app.patch("/api/leaves/:id/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access forbidden" });
    }

    const { status, adminNote } = req.body;
    const leaves = req.db.collection("leaves");

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const leave = await leaves.findOne({ _id: new ObjectId(req.params.id) });
    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    await leaves.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, adminNote: adminNote || "", updatedAt: new Date() } }
    );

    const updatedLeave = await leaves.findOne({ _id: new ObjectId(req.params.id) });

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. Final Setup & Server Start
// ==========================================

// Health check
app.get("/health", (req, res) => {
  res.json({
    message: "OFF_SITE API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;