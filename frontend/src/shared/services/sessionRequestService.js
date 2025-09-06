import api from "./api.service";

class SessionRequestService {
  /**
   * Create a new session request
   * @param {Object} requestData - Session request data
   * @returns {Promise<Object>} Created session request
   */
  async createSessionRequest(requestData) {
    try {
      console.log("Making request to session-requests endpoint");
      console.log("Request data:", requestData);

      const response = await api.post("/session-requests", requestData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session requests for the current user
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Session requests data with pagination
   */
  async getSessionRequests(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(
        `/session-requests?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Accept a session request (tutor only)
   * @param {string} requestId - Session request ID
   * @param {string} tutorResponse - Optional response message
   * @returns {Promise<Object>} Updated request and created session
   */
  async acceptSessionRequest(requestId, tutorResponse = "") {
    try {
      const response = await api.patch(
        `/session-requests/${requestId}/accept`,
        { tutorResponse }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Decline a session request (tutor only)
   * @param {string} requestId - Session request ID
   * @param {string} declineReason - Reason for declining
   * @param {string} tutorResponse - Optional response message
   * @returns {Promise<Object>} Updated request
   */
  async declineSessionRequest(requestId, declineReason, tutorResponse = "") {
    try {
      const response = await api.patch(
        `/session-requests/${requestId}/decline`,
        { declineReason, tutorResponse }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a session request (student only)
   * @param {string} requestId - Session request ID
   * @returns {Promise<Object>} Updated request
   */
  async cancelSessionRequest(requestId) {
    try {
      const response = await api.patch(
        `/session-requests/${requestId}/cancel`,
        {}
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session request statistics
   * @returns {Promise<Object>} Session request statistics
   */
  async getSessionRequestStatistics() {
    try {
      const response = await api.get(`/session-requests/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error
   * @throws {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data.message || data.error || "An error occurred";

      switch (status) {
        case 400:
          throw new Error(`Bad Request: ${message}`);
        case 401:
          throw new Error("Unauthorized. Please log in again.");
        case 403:
          throw new Error(
            "Access denied. You do not have permission to perform this action."
          );
        case 404:
          throw new Error("Session request not found.");
        case 409:
          throw new Error(`Conflict: ${message}`);
        case 422:
          throw new Error(`Validation Error: ${message}`);
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error("Network error. Please check your connection.");
    } else {
      // Other error
      throw new Error(error.message || "An unexpected error occurred.");
    }
  }

  /**
   * Format session request data for display
   * @param {Object} request - Raw session request data
   * @returns {Object} Formatted session request data
   */
  formatSessionRequestData(request) {
    return {
      ...request,
      formattedStartTime: new Date(request.requestedStartTime).toLocaleString(),
      formattedEndTime: new Date(request.requestedEndTime).toLocaleString(),
      duration: this.calculateDuration(
        request.requestedStartTime,
        request.requestedEndTime
      ),
      isExpired: new Date(request.expiresAt) < new Date(),
      isPending: request.status === "pending",
      isAccepted: request.status === "accepted",
      isDeclined: request.status === "declined",
      isCancelled: request.status === "cancelled",
    };
  }

  /**
   * Calculate session duration
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {string} Duration string
   */
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  // Alias methods for backward compatibility
  async getRequestsForTutor(params = {}) {
    try {
      const response = await this.getSessionRequests({
        ...params,
        status: "pending",
      });
      return response.sessionRequests || response;
    } catch (error) {
      throw error;
    }
  }

  async getRequestsForStudent(params = {}) {
    try {
      const response = await this.getSessionRequests(params);
      return response.sessionRequests || response;
    } catch (error) {
      throw error;
    }
  }

  async acceptRequest(requestId, tutorResponse = "") {
    return this.acceptSessionRequest(requestId, tutorResponse);
  }

  async declineRequest(requestId, declineReason, tutorResponse = "") {
    return this.declineSessionRequest(requestId, declineReason, tutorResponse);
  }
}

export default new SessionRequestService();
