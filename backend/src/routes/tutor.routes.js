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
