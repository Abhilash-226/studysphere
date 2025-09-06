const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/auth.middleware");
const emailVerificationController = require("../controllers/emailVerification.controller");

const router = express.Router();

/**
 * POST /api/auth/send-verification-email
 * Send verification email to user (public route)
 */
router.post(
  "/send-verification-email",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
  emailVerificationController.sendVerificationEmail
);

/**
 * GET /api/auth/verify-email/:token
 * Verify email with token (public route)
 */
router.get("/verify-email/:token", emailVerificationController.verifyEmail);

/**
 * GET /api/auth/verification-status
 * Check email verification status (protected route)
 */
router.get(
  "/verification-status",
  authenticateToken,
  emailVerificationController.checkVerificationStatus
);

/**
 * POST /api/auth/resend-verification
 * Resend verification email for authenticated users (protected route)
 */
router.post(
  "/resend-verification",
  authenticateToken,
  emailVerificationController.resendVerificationEmail
);

module.exports = router;
