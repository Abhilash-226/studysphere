/**
 * Payment Service
 * Handles payment processing with support for development, test, and live modes
 *
 * Modes:
 * - development: Bypasses actual payment, auto-succeeds
 * - test: Uses Razorpay test mode with test credentials
 * - live: Uses Razorpay live mode with real money
 */

const Payment = require("../models/payment.model");

// Get payment mode from environment
const PAYMENT_MODE = process.env.PAYMENT_MODE || "development";

// Razorpay instance (only initialized if not in development mode)
let razorpay = null;

const initializeRazorpay = () => {
  if (PAYMENT_MODE !== "development" && !razorpay) {
    try {
      const Razorpay = require("razorpay");
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log(`Razorpay initialized in ${PAYMENT_MODE} mode`);
    } catch (error) {
      console.error("Failed to initialize Razorpay:", error.message);
    }
  }
  return razorpay;
};

/**
 * Create a payment order for a session
 * @param {Object} params - Payment parameters
 * @param {Object} params.session - Session object
 * @param {String} params.payerId - User ID of payer (student)
 * @param {String} params.payeeId - User ID of payee (tutor)
 * @param {Number} params.amount - Amount in INR
 * @returns {Object} Payment order details
 */
const createPaymentOrder = async ({ session, payerId, payeeId, amount }) => {
  const platformFeePercent = parseFloat(
    process.env.PLATFORM_FEE_PERCENT || "0"
  );
  const platformFee = Math.round(amount * (platformFeePercent / 100));
  const tutorAmount = amount - platformFee;

  // Create payment record
  const payment = new Payment({
    session: session._id,
    payer: payerId,
    payee: payeeId,
    amount,
    currency: "INR",
    platformFee,
    tutorAmount,
    status: "pending",
    mode: PAYMENT_MODE,
  });

  if (PAYMENT_MODE === "development") {
    // Development mode: Auto-authorize payment
    payment.status = "authorized";
    payment.authorizedAt = new Date();
    payment.paymentMethod = "development";
    payment.razorpay = {
      orderId: `dev_order_${Date.now()}`,
      paymentId: `dev_pay_${Date.now()}`,
    };
    await payment.save();

    return {
      success: true,
      mode: "development",
      payment: {
        id: payment._id,
        orderId: payment.razorpay.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
      message: "Development mode: Payment auto-authorized",
    };
  }

  // Test/Live mode: Create Razorpay order
  try {
    initializeRazorpay();

    if (!razorpay) {
      throw new Error("Razorpay not configured. Please add API keys.");
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `session_${session._id}`,
      notes: {
        sessionId: session._id.toString(),
        studentId: payerId,
        tutorId: payeeId,
      },
    });

    payment.razorpay.orderId = razorpayOrder.id;
    await payment.save();

    return {
      success: true,
      mode: PAYMENT_MODE,
      payment: {
        id: payment._id,
        orderId: razorpayOrder.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "StudySphere",
        description: `Session: ${session.title}`,
      },
    };
  } catch (error) {
    payment.status = "failed";
    payment.errorMessage = error.message;
    payment.failedAt = new Date();
    await payment.save();

    throw error;
  }
};

/**
 * Verify and authorize payment after Razorpay checkout
 * @param {Object} params - Verification parameters
 * @param {String} params.paymentId - MongoDB payment ID
 * @param {String} params.razorpayOrderId - Razorpay order ID
 * @param {String} params.razorpayPaymentId - Razorpay payment ID
 * @param {String} params.razorpaySignature - Razorpay signature
 * @returns {Object} Verification result
 */
const verifyPayment = async ({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (PAYMENT_MODE === "development") {
    // Development mode: Already authorized
    return {
      success: true,
      mode: "development",
      payment,
      message: "Development mode: Payment already authorized",
    };
  }

  // Verify signature
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    payment.status = "failed";
    payment.errorMessage = "Invalid payment signature";
    payment.failedAt = new Date();
    await payment.save();
    throw new Error("Payment verification failed: Invalid signature");
  }

  // Update payment with Razorpay details
  payment.razorpay.paymentId = razorpayPaymentId;
  payment.razorpay.signature = razorpaySignature;
  payment.status = "authorized";
  payment.authorizedAt = new Date();
  await payment.save();

  return {
    success: true,
    mode: PAYMENT_MODE,
    payment,
    message: "Payment verified and authorized",
  };
};

/**
 * Capture payment (after session completion approval)
 * @param {String} paymentId - MongoDB payment ID
 * @returns {Object} Capture result
 */
const capturePayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "authorized") {
    throw new Error(`Cannot capture payment with status: ${payment.status}`);
  }

  if (PAYMENT_MODE === "development") {
    // Development mode: Auto-capture
    payment.status = "captured";
    payment.capturedAt = new Date();
    await payment.save();

    return {
      success: true,
      mode: "development",
      payment,
      message: "Development mode: Payment auto-captured",
    };
  }

  // In Razorpay, payments are auto-captured by default
  // If using manual capture, implement here
  payment.status = "captured";
  payment.capturedAt = new Date();
  await payment.save();

  return {
    success: true,
    mode: PAYMENT_MODE,
    payment,
    message: "Payment captured successfully",
  };
};

/**
 * Refund a payment
 * @param {String} paymentId - MongoDB payment ID
 * @param {Object} params - Refund parameters
 * @param {String} params.reason - Refund reason
 * @param {String} params.initiatedBy - User ID who initiated refund
 * @param {Number} params.amount - Refund amount (optional, defaults to full)
 * @returns {Object} Refund result
 */
const refundPayment = async (paymentId, { reason, initiatedBy, amount }) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (!["authorized", "captured"].includes(payment.status)) {
    throw new Error(`Cannot refund payment with status: ${payment.status}`);
  }

  const refundAmount = amount || payment.amount;

  if (PAYMENT_MODE === "development") {
    // Development mode: Auto-refund
    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.refund = {
      reason,
      amount: refundAmount,
      initiatedBy,
      initiatedAt: new Date(),
    };
    await payment.save();

    return {
      success: true,
      mode: "development",
      payment,
      message: "Development mode: Payment auto-refunded",
    };
  }

  // Razorpay refund
  try {
    initializeRazorpay();

    const refund = await razorpay.payments.refund(payment.razorpay.paymentId, {
      amount: refundAmount * 100, // In paise
      notes: {
        reason,
        initiatedBy,
      },
    });

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.razorpay.refundId = refund.id;
    payment.refund = {
      reason,
      amount: refundAmount,
      initiatedBy,
      initiatedAt: new Date(),
    };
    await payment.save();

    return {
      success: true,
      mode: PAYMENT_MODE,
      payment,
      message: "Payment refunded successfully",
    };
  } catch (error) {
    payment.errorMessage = error.message;
    await payment.save();
    throw error;
  }
};

/**
 * Get payment by session ID
 * @param {String} sessionId - Session MongoDB ID
 * @returns {Object} Payment object
 */
const getPaymentBySession = async (sessionId) => {
  return await Payment.findOne({ session: sessionId })
    .populate("payer", "firstName lastName email")
    .populate("payee", "firstName lastName email");
};

/**
 * Get payments by user (as payer or payee)
 * @param {String} userId - User MongoDB ID
 * @param {String} role - 'payer' or 'payee'
 * @returns {Array} Payment objects
 */
const getPaymentsByUser = async (userId, role = "payer") => {
  const query = role === "payer" ? { payer: userId } : { payee: userId };
  return await Payment.find(query)
    .populate("session")
    .populate("payer", "firstName lastName email")
    .populate("payee", "firstName lastName email")
    .sort({ createdAt: -1 });
};

/**
 * Get current payment mode
 * @returns {String} Current payment mode
 */
const getPaymentMode = () => {
  return PAYMENT_MODE;
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  capturePayment,
  refundPayment,
  getPaymentBySession,
  getPaymentsByUser,
  getPaymentMode,
  PAYMENT_MODE,
};
