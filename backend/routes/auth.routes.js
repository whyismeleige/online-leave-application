const express = require("express");
const controller = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get("/profile", authenticateToken, controller.getProfile)
router.post("/logout", authenticateToken, controller.logout);

module.exports = router;