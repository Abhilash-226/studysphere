/**
 * Classroom Routes
 * Routes for online classroom/meeting functionality
 */

const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const classroomController = require("../controllers/classroom.controller");

const router = express.Router();

/**
 * @route   POST /api/classroom/:sessionId/start
 * @desc    Start a class (Tutor only)
 * @access  Private (Tutor)
 */
router.post(
  "/:sessionId/start",
  authenticateToken,
  checkRole(["tutor"]),
  classroomController.startClass
);

/**
 * @route   POST /api/classroom/:sessionId/join
 * @desc    Join a class (Student or Tutor)
 * @access  Private
 */
router.post(
  "/:sessionId/join",
  authenticateToken,
  classroomController.joinClass
);

/**
 * @route   POST /api/classroom/:sessionId/end
 * @desc    End a class (Tutor only)
 * @access  Private (Tutor)
 */
router.post(
  "/:sessionId/end",
  authenticateToken,
  checkRole(["tutor"]),
  classroomController.endClass
);

/**
 * @route   GET /api/classroom/:sessionId/status
 * @desc    Get class status
 * @access  Private
 */
router.get(
  "/:sessionId/status",
  authenticateToken,
  classroomController.getClassStatus
);

module.exports = router;
