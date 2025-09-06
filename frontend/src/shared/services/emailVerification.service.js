import api from "./api.service";

class EmailVerificationService {
  /**
   * Send verification email to a specific email address
   * @param {string} email - Email address to send verification to
   */
  async sendVerificationEmail(email) {
    try {
      const response = await api.post("/auth/send-verification-email", {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token from email
   */
  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check current user's email verification status
   */
  async checkVerificationStatus() {
    try {
      const response = await api.get("/auth/verification-status");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend verification email for authenticated user
   */
  async resendVerificationEmail() {
    try {
      const response = await api.post("/auth/resend-verification");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if email verification is required for user actions
   * @param {Object} user - Current user object
   */
  isVerificationRequired(user) {
    return user && !user.isEmailVerified;
  }

  /**
   * Get verification reminder message based on user's verification status
   * @param {Object} user - Current user object
   */
  getVerificationMessage(user) {
    if (!user) return null;

    if (!user.isEmailVerified) {
      return {
        type: "warning",
        title: "Email Verification Required",
        message: "Please verify your email address to access all features.",
        action: "Verify Now",
      };
    }

    return null;
  }

  /**
   * Handle service errors
   * @param {Object} error - Error object
   */
  handleError(error) {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || "An error occurred",
        retryAfter: error.response.data.retryAfter,
        attemptsLeft: error.response.data.attemptsLeft,
        status: error.response.status,
      };
    }
    return {
      success: false,
      message: "Network error or server is unavailable",
      status: 500,
    };
  }
}

export default new EmailVerificationService();
