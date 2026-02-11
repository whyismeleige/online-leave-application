// routes/leave.routes.js
// Leave application routes
// Some are for employees, some for admins only

const express = require("express");
const controller = require("../controllers/leave.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// All leave routes require authentication
router.use(authenticateToken);

// ── EMPLOYEE ROUTES ────────────────────────────────────────────────────────────
router.post("/", controller.applyLeave);               // POST   /api/leaves          → Apply
router.get("/my", controller.getMyLeaves);             // GET    /api/leaves/my        → My history
router.get("/:id", controller.getLeave);               // GET    /api/leaves/:id       → Single leave
router.put("/:id", controller.updateLeave);            // PUT    /api/leaves/:id       → Edit (Pending only)
router.delete("/:id", controller.deleteLeave);         // DELETE /api/leaves/:id       → Cancel (Pending only)

// ── ADMIN ONLY ROUTES ──────────────────────────────────────────────────────────
router.get("/", authorizeRoles("admin"), controller.getAllLeaves);                     // GET all leaves
router.patch("/:id/status", authorizeRoles("admin"), controller.updateLeaveStatus);   // Approve / Reject

module.exports = router;