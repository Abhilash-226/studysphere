const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const studentProfileController = require("../controllers/studentProfile.controller");

const router = express.Router();

// Student routes (for students to manage their own profiles)
router.get(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  studentProfileController.getMyProfile
);

router.put(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  studentProfileController.updateProfile
);

// Tutor routes (for tutors to view student profiles)
router.get(
  "/profile/:studentId",
  authenticateToken,
  checkRole(["tutor"]),
  studentProfileController.getStudentProfileById
);

router.get(
  "/summary/:studentId",
  authenticateToken,
  checkRole(["tutor"]),
  studentProfileController.getStudentSummary
);

router.get(
  "/my-students",
  authenticateToken,
  checkRole(["tutor"]),
  studentProfileController.getMyStudents
);

module.exports = router;
