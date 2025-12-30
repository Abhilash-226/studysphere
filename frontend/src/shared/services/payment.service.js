import api from "./api.service";

/**
 * Payment Service
 * Handles all payment-related API calls
 */
class PaymentService {
  /**
   * Get current payment mode
   * @returns {Promise<Object>} Payment mode info
   */
  async getPaymentMode() {
    try {
      const response = await api.get("/payments/mode");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a payment order for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Payment order details
   */
  async createPaymentOrder(sessionId) {
    try {
      const response = await api.post("/payments/create-order", { sessionId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify payment after Razorpay checkout
   * @param {Object} params - Payment verification params
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(params) {
    try {
      const response = await api.post("/payments/verify", params);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment details for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentBySession(sessionId) {
    try {
      const response = await api.get(`/payments/session/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment history for current user
   * @returns {Promise<Array>} Payment history
   */
  async getPaymentHistory() {
    try {
      const response = await api.get("/payments/history");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initialize Razorpay checkout
   * @param {Object} options - Razorpay options
   * @param {Function} onSuccess - Success callback
   * @param {Function} onFailure - Failure callback
   */
  initializeRazorpayCheckout(options, onSuccess, onFailure) {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      onFailure({ error: "Payment gateway not available" });
      return;
    }

    const rzpOptions = {
      key: options.key,
      amount: options.amount,
      currency: options.currency || "INR",
      name: options.name || "StudySphere",
      description: options.description || "Session Payment",
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || "",
        email: options.prefill?.email || "",
        contact: options.prefill?.contact || "",
      },
      theme: {
        color: "#007bff",
      },
      handler: function (response) {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          onFailure({ error: "Payment cancelled by user" });
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  }

  /**
   * Process payment for a session (handles both dev and live modes)
   * @param {string} sessionId - Session ID
   * @param {Object} userInfo - User info for prefill
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(sessionId, userInfo = {}) {
    try {
      // Create payment order
      const orderResult = await this.createPaymentOrder(sessionId);

      if (!orderResult.success) {
        throw new Error(
          orderResult.message || "Failed to create payment order"
        );
      }

      // In development mode, payment is auto-authorized
      if (orderResult.mode === "development") {
        return {
          success: true,
          mode: "development",
          message: "Payment processed (development mode)",
          payment: orderResult.payment,
        };
      }

      // In test/live mode, open Razorpay checkout
      return new Promise((resolve, reject) => {
        this.initializeRazorpayCheckout(
          {
            key: orderResult.razorpay.key,
            amount: orderResult.razorpay.amount,
            currency: orderResult.razorpay.currency,
            name: orderResult.razorpay.name,
            description: orderResult.razorpay.description,
            orderId: orderResult.razorpay.orderId,
            prefill: userInfo,
          },
          async (response) => {
            try {
              // Verify payment
              const verifyResult = await this.verifyPayment({
                paymentId: orderResult.payment.id,
                ...response,
              });
              resolve({
                success: true,
                mode: orderResult.mode,
                message: "Payment successful",
                payment: verifyResult.payment,
              });
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in smallest unit
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(amount);
  }

  /**
   * Get payment status badge variant
   * @param {string} status - Payment status
   * @returns {string} Bootstrap badge variant
   */
  getStatusBadgeVariant(status) {
    const variants = {
      pending: "warning",
      authorized: "info",
      captured: "success",
      completed: "success",
      failed: "danger",
      refunded: "secondary",
      cancelled: "secondary",
    };
    return variants[status] || "secondary";
  }
}

export default new PaymentService();
