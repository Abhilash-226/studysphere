const Payment = require("../models/payment.model");
const Session = require("../models/session.model");
const Student = require("../models/student.model");
const Tutor = require("../models/tutor.model");
const paymentService = require("../services/payment.service");

/**
 * Create a payment order for a session booking
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    // Find the session
    const session = await Session.findById(sessionId)
      .populate({
        path: "tutor",
        populate: { path: "user", select: "_id" },
      })
      .populate({
        path: "student",
        populate: { path: "user", select: "_id" },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify the user is the student for this session
    if (session.student.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the student can initiate payment for this session",
      });
    }

    // Check if payment already exists for this session
    const existingPayment = await Payment.findOne({ session: sessionId });
    if (existingPayment && existingPayment.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Payment already initiated for this session",
        payment: {
          id: existingPayment._id,
          status: existingPayment.status,
        },
      });
    }

    // Create payment order
    const result = await paymentService.createPaymentOrder({
      session,
      payerId: userId,
      payeeId: session.tutor.user._id.toString(),
      amount: session.price,
    });

    // Update session payment status
    session.paymentStatus =
      result.payment.status === "authorized" ? "completed" : "pending";
    await session.save();

    res.status(200).json({
      success: true,
      message: result.message,
      mode: result.mode,
      payment: result.payment,
      razorpay: result.razorpay, // Only present in test/live mode
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/**
 * Verify payment after Razorpay checkout
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const result = await paymentService.verifyPayment({
      paymentId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Update session payment status
    const payment = await Payment.findById(paymentId);
    if (payment) {
      const session = await Session.findById(payment.session);
      if (session) {
        session.paymentStatus = "completed";
        await session.save();
      }
    }

    res.status(200).json({
      success: true,
      message: result.message,
      payment: {
        id: result.payment._id,
        status: result.payment.status,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(400).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/**
 * Capture payment after session completion
 */
exports.capturePayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find payment for this session
    const payment = await Payment.findOne({ session: sessionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this session",
      });
    }

    const result = await paymentService.capturePayment(payment._id);

    res.status(200).json({
      success: true,
      message: result.message,
      payment: {
        id: result.payment._id,
        status: result.payment.status,
        capturedAt: result.payment.capturedAt,
      },
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to capture payment",
      error: error.message,
    });
  }
};

/**
 * Refund payment (for cancelled/rejected sessions)
 */
exports.refundPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Find payment for this session
    const payment = await Payment.findOne({ session: sessionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this session",
      });
    }

    const result = await paymentService.refundPayment(payment._id, {
      reason: reason || "Session cancelled or rejected",
      initiatedBy: userId,
    });

    // Update session payment status
    const session = await Session.findById(sessionId);
    if (session) {
      session.paymentStatus = "refunded";
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: result.message,
      payment: {
        id: result.payment._id,
        status: result.payment.status,
        refundedAt: result.payment.refundedAt,
      },
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refund payment",
      error: error.message,
    });
  }
};

/**
 * Get payment details by session
 */
exports.getPaymentBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const payment = await paymentService.getPaymentBySession(sessionId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this session",
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        mode: payment.mode,
        paymentMethod: payment.paymentMethod,
        platformFee: payment.platformFee,
        tutorAmount: payment.tutorAmount,
        authorizedAt: payment.authorizedAt,
        capturedAt: payment.capturedAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

/**
 * Get payment history for current user
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get payments based on role
    const role = userRole === "tutor" ? "payee" : "payer";
    const payments = await paymentService.getPaymentsByUser(userId, role);

    const formattedPayments = payments.map((payment) => ({
      id: payment._id,
      sessionId: payment.session?._id,
      sessionTitle: payment.session?.title,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      mode: payment.mode,
      paymentMethod: payment.paymentMethod,
      platformFee: payment.platformFee,
      tutorAmount: payment.tutorAmount,
      payer: payment.payer
        ? {
            name: `${payment.payer.firstName} ${payment.payer.lastName}`,
            email: payment.payer.email,
          }
        : null,
      payee: payment.payee
        ? {
            name: `${payment.payee.firstName} ${payment.payee.lastName}`,
            email: payment.payee.email,
          }
        : null,
      createdAt: payment.createdAt,
      authorizedAt: payment.authorizedAt,
      capturedAt: payment.capturedAt,
      refundedAt: payment.refundedAt,
    }));

    res.status(200).json({
      success: true,
      payments: formattedPayments,
      count: formattedPayments.length,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

/**
 * Get current payment mode (for frontend display)
 */
exports.getPaymentMode = async (req, res) => {
  try {
    const mode = paymentService.getPaymentMode();

    res.status(200).json({
      success: true,
      mode,
      isDevelopment: mode === "development",
      isTest: mode === "test",
      isLive: mode === "live",
    });
  } catch (error) {
    console.error("Error getting payment mode:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment mode",
      error: error.message,
    });
  }
};

/**
 * Razorpay Webhook handler
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log("Razorpay Webhook received:", event);

    switch (event) {
      case "payment.authorized":
        // Payment authorized - update payment status
        const authorizedPayment = await Payment.findOne({
          "razorpay.orderId": payload.payment.entity.order_id,
        });
        if (authorizedPayment) {
          authorizedPayment.status = "authorized";
          authorizedPayment.authorizedAt = new Date();
          authorizedPayment.razorpay.paymentId = payload.payment.entity.id;
          await authorizedPayment.save();
        }
        break;

      case "payment.captured":
        // Payment captured
        const capturedPayment = await Payment.findOne({
          "razorpay.paymentId": payload.payment.entity.id,
        });
        if (capturedPayment) {
          capturedPayment.status = "captured";
          capturedPayment.capturedAt = new Date();
          await capturedPayment.save();
        }
        break;

      case "payment.failed":
        // Payment failed
        const failedPayment = await Payment.findOne({
          "razorpay.orderId": payload.payment.entity.order_id,
        });
        if (failedPayment) {
          failedPayment.status = "failed";
          failedPayment.failedAt = new Date();
          failedPayment.errorMessage = payload.payment.entity.error_description;
          failedPayment.errorCode = payload.payment.entity.error_code;
          await failedPayment.save();
        }
        break;

      case "refund.created":
        // Refund created
        const refundedPayment = await Payment.findOne({
          "razorpay.paymentId": payload.refund.entity.payment_id,
        });
        if (refundedPayment) {
          refundedPayment.status = "refunded";
          refundedPayment.refundedAt = new Date();
          refundedPayment.razorpay.refundId = payload.refund.entity.id;
          await refundedPayment.save();
        }
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};
