const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");

const router = express.Router();

// GET student profile (protected - student only)
router.get(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Get student profile - Not implemented yet" });
  }
);

// UPDATE student profile (protected - student only)
router.put(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Update student profile - Not implemented yet" });
  }
);

// GET student's upcoming sessions (protected - student only)
router.get(
  "/sessions",
  authenticateToken,
  checkRole(["student", "admin"]), // Allow both student and admin roles
  (req, res) => {
    const { status } = req.query;

    // Return demo data for now
    const sessions = [
      {
        _id: "session1",
        tutor: {
          _id: "tutor1",
          name: "John Smith",
          profileImage: "/images/tutors/tutor-placeholder.svg",
          rating: 4.8,
          subject: "Mathematics",
        },
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
        subject: "Algebra",
        status: "upcoming",
        meetingUrl: "https://meet.example.com/abcd1234",
      },
      {
        _id: "session2",
        tutor: {
          _id: "tutor2",
          name: "Emily Johnson",
          profileImage: "/images/tutors/tutor-placeholder.svg",
          rating: 4.9,
          subject: "Science",
        },
        startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // Day after tomorrow + 1 hour
        subject: "Physics",
        status: "upcoming",
        meetingUrl: "https://meet.example.com/efgh5678",
      },
    ];

    // Filter by status if provided
    const filteredSessions = status
      ? sessions.filter((session) => session.status === status)
      : sessions;

    res.status(200).json({
      success: true,
      data: filteredSessions,
    });
  }
);

// GET student's favorite tutors (protected - student only)
router.get(
  "/favorites",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Get favorite tutors - Not implemented yet" });
  }
);

// ADD tutor to favorites (protected - student only)
router.post(
  "/favorites/:tutorId",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res.status(501).json({ message: "Add to favorites - Not implemented yet" });
  }
);

// REMOVE tutor from favorites (protected - student only)
router.delete(
  "/favorites/:tutorId",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Remove from favorites - Not implemented yet" });
  }
);

module.exports = router;
