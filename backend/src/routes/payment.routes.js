const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

// Get payment mode (public - for frontend to know current mode)
router.get("/mode", paymentController.getPaymentMode);

// Create payment order (student only)
router.post(
  "/create-order",
  authenticateToken,
  checkRole(["student"]),
  paymentController.createPaymentOrder
);

// Verify payment after Razorpay checkout (student only)
router.post(
  "/verify",
  authenticateToken,
  checkRole(["student"]),
  paymentController.verifyPayment
);

// Get payment by session ID (authenticated)
router.get(
  "/session/:sessionId",
  authenticateToken,
  paymentController.getPaymentBySession
);

// Get payment history for current user (authenticated)
router.get("/history", authenticateToken, paymentController.getPaymentHistory);

// Capture payment (internal - called after session completion approval)
router.post(
  "/capture/:sessionId",
  authenticateToken,
  paymentController.capturePayment
);

// Refund payment (admin or automated on session rejection)
router.post(
  "/refund/:sessionId",
  authenticateToken,
  paymentController.refundPayment
);

// Razorpay webhook (no auth - verified by signature)
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
