const express = require("express");
const router = express.Router();
const offlineClassroomController = require("../controllers/offlineClassroom.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const { classroomImageUpload } = require("../config/upload");

/**
 * Offline Classroom Routes
 * Routes for the classroom marketplace feature
 *
 * Public Routes: Browse classrooms, view details
 * Tutor Routes: Create, update, delete, manage classrooms
 */

// ============ PUBLIC ROUTES ============

// Get all active classrooms with filters
router.get("/", offlineClassroomController.getAllClassrooms);

// Get unique cities for filter dropdown
router.get("/cities", offlineClassroomController.getCities);

// Get unique subjects for filter dropdown
router.get("/subjects", offlineClassroomController.getSubjects);

// Get classroom by ID or slug
router.get("/:id", offlineClassroomController.getClassroomById);

// Record an inquiry (when someone views contact info)
router.post("/:id/inquiry", offlineClassroomController.recordInquiry);

// ============ TUTOR ROUTES ============

// Get tutor's own classrooms
router.get(
  "/tutor/my-classrooms",
  authenticateToken,
  checkRole(["tutor"]),
  offlineClassroomController.getMyClassrooms,
);

// Create a new classroom
router.post(
  "/",
  authenticateToken,
  checkRole(["tutor"]),
  offlineClassroomController.createClassroom,
);

// Update a classroom
router.put(
  "/:id",
  authenticateToken,
  checkRole(["tutor"]),
  offlineClassroomController.updateClassroom,
);

// Toggle classroom status
router.patch(
  "/:id/status",
  authenticateToken,
  checkRole(["tutor"]),
  offlineClassroomController.toggleClassroomStatus,
);

// Delete a classroom
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["tutor"]),
  offlineClassroomController.deleteClassroom,
);

// Upload classroom images (up to 5 images)
router.post(
  "/upload-images",
  authenticateToken,
  checkRole(["tutor"]),
  classroomImageUpload.array("images", 5),
  offlineClassroomController.uploadClassroomImages,
);

module.exports = router;
