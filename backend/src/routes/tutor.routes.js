const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const { uploadDocument, uploadProfileImage } = require("../middleware/uploads");
const tutorController = require("../controllers/tutor.controller");

const router = express.Router();

// GET featured tutors for homepage (public)
router.get("/featured", tutorController.getFeaturedTutors);

// GET all tutors (public)
router.get("/", tutorController.getAllTutors);

// GET tutor profile (protected - tutor only)
router.get(
  "/profile",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getProfile
);

// GET tutor verification status (protected - tutor only)
router.get(
  "/verification-status",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getVerificationStatus
);

// GET tutor dashboard statistics (protected - tutor only)
router.get(
  "/dashboard-stats",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getDashboardStats
);

// GET tutor notification count (protected - tutor only)
router.get(
  "/notifications/count",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getNotificationCount
);

// GET tutor pending session requests count (protected - tutor only)
router.get(
  "/session-requests/count",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getPendingRequestsCount
);

// GET tutor sessions (protected - tutor only)
router.get(
  "/sessions",
  authenticateToken,
  checkRole(["tutor"]),
  tutorController.getTutorSessions
);

// GET single tutor (public) - IMPORTANT: This must be AFTER all other specific routes
router.get("/:id", tutorController.getTutorById);

// UPDATE tutor profile (protected - tutor only)
router.put(
  "/profile",
  authenticateToken,
  checkRole(["tutor"]),
  uploadProfileImage.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
    { name: "qualificationDocument", maxCount: 1 },
    { name: "markSheet", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 },
    { name: "additionalCertificates", maxCount: 1 },
  ]),
  tutorController.updateProfile
);

// GET tutor availability (public)
router.get("/:id/availability", (req, res) => {
  res
    .status(501)
    .json({ message: "Get tutor availability - Not implemented yet" });
});

// UPDATE tutor availability (protected - tutor only)
router.put(
  "/availability",
  authenticateToken,
  checkRole(["tutor"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Update tutor availability - Not implemented yet" });
  }
);

// GET tutor sessions (protected - tutor only)
router.get("/sessions", authenticateToken, checkRole(["tutor"]), (req, res) => {
  const status = req.query.status || "all";

  // Mock data for upcoming sessions
  const upcomingSessions = [
    {
      id: "session1",
      studentName: "Alice Johnson",
      studentImage: "https://randomuser.me/api/portraits/women/32.jpg",
      subject: "Mathematics",
      topic: "Calculus - Derivatives",
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      status: "confirmed",
      notes: "Focus on application problems",
    },
    {
      id: "session2",
      studentName: "Bob Smith",
      studentImage: "https://randomuser.me/api/portraits/men/45.jpg",
      subject: "Physics",
      topic: "Mechanics - Newton's Laws",
      date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      startTime: "3:00 PM",
      endTime: "4:30 PM",
      status: "pending",
      notes: "Student requested practice problems",
    },
  ];

  res.status(200).json(upcomingSessions);
});

// ADMIN: Update tutor verification status (protected - admin only)
router.put(
  "/:id/verification-status",
  authenticateToken,
  checkRole(["admin"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Update verification status - Not implemented yet" });
  }
);

module.exports = router;
