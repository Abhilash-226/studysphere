const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Tutor Verification
router.get("/verifications", adminController.getPendingVerifications);
router.get("/verifications/:tutorId", adminController.getTutorForVerification);
router.post("/verifications/:tutorId/approve", adminController.approveTutor);
router.post("/verifications/:tutorId/reject", adminController.rejectTutor);
router.post(
  "/verifications/:tutorId/request-info",
  adminController.requestMoreInfo
);

// User Management
router.get("/users", adminController.getAllUsers);

module.exports = router;
