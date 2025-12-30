const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Reference to session
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    // Payer (student)
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Payee (tutor)
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Amount details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    // Platform fee (percentage taken by StudySphere)
    platformFee: {
      type: Number,
      default: 0,
    },
    // Amount to be paid to tutor
    tutorAmount: {
      type: Number,
      required: true,
    },
    // Payment status
    status: {
      type: String,
      enum: [
        "pending", // Payment initiated
        "authorized", // Payment authorized (funds held)
        "captured", // Payment captured (session completed)
        "completed", // Payment fully processed
        "failed", // Payment failed
        "refunded", // Payment refunded
        "cancelled", // Payment cancelled before capture
      ],
      default: "pending",
    },
    // Payment mode used
    mode: {
      type: String,
      enum: ["development", "test", "live"],
      default: "development",
    },
    // Razorpay specific fields
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
      refundId: String,
    },
    // Payment method used
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "development"],
      default: "development",
    },
    // Timestamps for tracking
    authorizedAt: Date,
    capturedAt: Date,
    refundedAt: Date,
    failedAt: Date,
    // Error details if payment failed
    errorMessage: String,
    errorCode: String,
    // Refund details
    refund: {
      reason: String,
      amount: Number,
      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      initiatedAt: Date,
    },
    // Additional metadata
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ session: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ payee: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ "razorpay.orderId": 1 });
paymentSchema.index({ "razorpay.paymentId": 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
