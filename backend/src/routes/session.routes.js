const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const sessionController = require("../controllers/session.controller");

const router = express.Router();

// CREATE a new session (protected - student only)
router.post(
  "/",
  authenticateToken,
  checkRole(["student"]),
  sessionController.createSession
);

// GET all sessions for current user (protected)
router.get("/", authenticateToken, sessionController.getAllSessions);

// GET tutor's sessions (teaching schedule) (protected - tutor only)
router.get(
  "/tutor",
  authenticateToken,
  checkRole(["tutor"]),
  sessionController.getTutorSessions
);

// GET session statistics (protected)
router.get(
  "/statistics",
  authenticateToken,
  sessionController.getSessionStatistics
);

// DEVELOPMENT ONLY - Clear all sessions (for testing)
router.delete("/clear-all", authenticateToken, async (req, res) => {
  try {
    const Session = require("../models/session.model");
    await Session.deleteMany({});
    res.json({ success: true, message: "All sessions cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to clear sessions" });
  }
});

// CHECK tutor availability (protected)
router.post(
  "/check-availability",
  authenticateToken,
  sessionController.checkTutorAvailability
);

// GET available time slots for a tutor (protected)
router.get(
  "/available-slots/:tutorId",
  authenticateToken,
  sessionController.getAvailableTimeSlots
);

// GET single session (protected)
router.get("/:id", authenticateToken, sessionController.getSessionById);

// CANCEL session (protected)
router.patch("/:id/cancel", authenticateToken, sessionController.cancelSession);

// COMPLETE session (protected - tutor only)
router.patch(
  "/:id/complete",
  authenticateToken,
  checkRole(["tutor"]),
  sessionController.completeSession
);

// RESCHEDULE session (protected)
router.patch(
  "/:id/reschedule",
  authenticateToken,
  sessionController.rescheduleSession
);

// ADD review to session (protected - student only)
router.patch(
  "/:id/review",
  authenticateToken,
  checkRole(["student"]),
  sessionController.addSessionReview
);

module.exports = router;
router.post("/:id/attachments", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Upload attachment - Not implemented yet" });
});

module.exports = router;
