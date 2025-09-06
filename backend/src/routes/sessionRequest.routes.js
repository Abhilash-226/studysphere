const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const sessionRequestController = require("../controllers/sessionRequest.controller");

const router = express.Router();

console.log("SessionRequest routes module loaded");
console.log(
  "Available controller functions:",
  Object.keys(sessionRequestController)
);

// CREATE a new session request (protected - student only)
router.post(
  "/",
  authenticateToken,
  checkRole(["student"]),
  (req, res, next) => {
    console.log("POST /session-requests route hit");
    next();
  },
  sessionRequestController.createSessionRequest
);

// GET all session requests for current user (protected)
router.get(
  "/",
  authenticateToken,
  (req, res, next) => {
    console.log("GET /session-requests route hit");
    next();
  },
  sessionRequestController.getSessionRequests
);

// GET session request statistics (protected)
router.get(
  "/statistics",
  authenticateToken,
  sessionRequestController.getSessionRequestStatistics
);

// ACCEPT session request (protected - tutor only)
router.patch(
  "/:id/accept",
  authenticateToken,
  checkRole(["tutor"]),
  sessionRequestController.acceptSessionRequest
);

// DECLINE session request (protected - tutor only)
router.patch(
  "/:id/decline",
  authenticateToken,
  checkRole(["tutor"]),
  sessionRequestController.declineSessionRequest
);

// CANCEL session request (protected - student only)
router.patch(
  "/:id/cancel",
  authenticateToken,
  checkRole(["student"]),
  sessionRequestController.cancelSessionRequest
);

module.exports = router;
