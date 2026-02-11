// user.model.js
// Defines the User schema for MongoDB using Mongoose
// This represents an employee or admin in the system

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    // Employee's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // Unique email used for login
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password (never stored in plain text)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never returned in queries by default
    },

    // Role determines access level: admin can manage all, employee can manage own
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    // Department the employee belongs to
    department: {
      type: String,
      trim: true,
      default: "General",
    },

    // Optional profile avatar URL
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ── PRE-SAVE HOOK ──────────────────────────────────────────────────────────────
// Runs before saving a user document to the database.
// Automatically hashes the password if it has been modified.
userSchema.pre("save", async function (next) {
  // Only hash if password was actually changed (not on every save)
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
});

// ── INSTANCE METHOD ────────────────────────────────────────────────────────────
// Compares a plain-text password against the stored hash
// Used during login to verify credentials
userSchema.methods.passwordsMatch = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;