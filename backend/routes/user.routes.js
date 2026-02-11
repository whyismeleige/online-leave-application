// routes/user.routes.js
// User management routes — all require admin role

const express = require("express");
const controller = require("../controllers/user.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// All routes below require: (1) valid token + (2) admin role
router.use(authenticateToken);
router.use(authorizeRoles("admin"));

router.get("/", controller.getAllUsers);       // GET  /api/users
router.get("/:id", controller.getUser);       // GET  /api/users/:id
router.put("/:id", controller.updateUser);    // PUT  /api/users/:id
router.delete("/:id", controller.deleteUser); // DELETE /api/users/:id

module.exports = router;