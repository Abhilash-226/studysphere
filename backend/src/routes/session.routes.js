const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");

const router = express.Router();

// CREATE a new session (protected - student only)
router.post("/", authenticateToken, checkRole(["student"]), (req, res) => {
  res.status(501).json({ message: "Create session - Not implemented yet" });
});

// GET all sessions for current user (protected)
router.get("/", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Get all sessions - Not implemented yet" });
});

// GET single session (protected)
router.get("/:id", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Get session by ID - Not implemented yet" });
});

// UPDATE session (protected)
router.put("/:id", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Update session - Not implemented yet" });
});

// CANCEL session (protected)
router.put("/:id/cancel", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Cancel session - Not implemented yet" });
});

// RESCHEDULE session (protected)
router.put("/:id/reschedule", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Reschedule session - Not implemented yet" });
});

// COMPLETE session (protected - tutor only)
router.put(
  "/:id/complete",
  authenticateToken,
  checkRole(["tutor"]),
  (req, res) => {
    res.status(501).json({ message: "Complete session - Not implemented yet" });
  }
);

// ADD review for session (protected - student only)
router.post(
  "/:id/review",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Add session review - Not implemented yet" });
  }
);

// Upload attachment to session
router.post("/:id/attachments", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Upload attachment - Not implemented yet" });
});

module.exports = router;
