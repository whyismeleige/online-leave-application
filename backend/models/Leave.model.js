// leave.model.js
// Defines the Leave Application schema for MongoDB
// This is the CORE model of the entire project

const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    // Reference to the User who applied for leave
    // This creates a relationship: Leave belongs to a User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the "User" model
      required: [true, "User is required"],
    },

    // Type of leave being requested
    leaveType: {
      type: String,
      enum: ["Casual", "Sick", "Paid", "Other"],
      required: [true, "Leave type is required"],
    },

    // Start date of the leave period
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },

    // End date of the leave period
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },

    // Reason provided by the employee
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },

    // Current approval status — only admin can change this
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending", // All new applications start as Pending
    },

    // Optional note from admin when approving/rejecting
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    // Automatically adds createdAt (when applied) and updatedAt fields
    timestamps: true,
  }
);

// ── VIRTUAL FIELD ──────────────────────────────────────────────────────────────
// Calculates the number of days between fromDate and toDate
// Virtual fields are computed, not stored in the database
leaveSchema.virtual("numberOfDays").get(function () {
  if (!this.fromDate || !this.toDate) return 0;
  const diff = this.toDate.getTime() - this.fromDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
});

// Make virtuals available when converting to JSON
leaveSchema.set("toJSON", { virtuals: true });
leaveSchema.set("toObject", { virtuals: true });

const Leave = mongoose.model("Leave", leaveSchema);
module.exports = Leave;