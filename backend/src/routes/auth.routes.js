const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/auth.controller");
const uploadController = require("../controllers/upload.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { documentUpload } = require("../config/upload");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
    check("role").optional().isIn(["student", "tutor"]),
  ],
  authController.register
);

// Login user
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.login
);

// Get current user
router.get("/me", authenticateToken, authController.getMe);

// Forgot password
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password/:token",
  [
    check("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
  ],
  authController.resetPassword
);

// Upload ID document for tutors
router.post(
  "/upload-id",
  authenticateToken,
  documentUpload.single("idDocument"),
  uploadController.uploadIdDocument
);

// Upload qualification document for tutors
router.post(
  "/upload-qualification",
  authenticateToken,
  documentUpload.single("qualificationDocument"),
  uploadController.uploadQualificationDocument
);

module.exports = router;
