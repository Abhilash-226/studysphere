import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class SessionService {
  /**
   * Get authorization headers
   * @returns {Object} Headers with authorization token
   */
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sessions`,
        sessionData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sessions for the current user
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.subject - Filter by subject
   * @param {string} params.startDate - Filter by start date
   * @param {string} params.endDate - Filter by end date
   * @returns {Promise<Object>} Sessions data with pagination
   */
  async getSessions(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/sessions?${queryParams.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session data
   */
  async getSessionById(sessionId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sessions/${sessionId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a session
   * @param {string} sessionId - Session ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated session
   */
  async cancelSession(sessionId, reason) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/sessions/${sessionId}/cancel`,
        { reason },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete a session (tutor only)
   * @param {string} sessionId - Session ID
   * @param {string} notes - Session notes
   * @returns {Promise<Object>} Updated session
   */
  async completeSession(sessionId, notes = "") {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/sessions/${sessionId}/complete`,
        { notes },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add review to a session (student only)
   * @param {string} sessionId - Session ID
   * @param {number} rating - Rating (1-5)
   * @param {string} review - Review text
   * @returns {Promise<Object>} Updated session
   */
  async addSessionReview(sessionId, rating, review = "") {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/sessions/${sessionId}/review`,
        { rating, review },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session statistics
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/statistics`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check tutor availability
   * @param {string} tutorId - Tutor ID
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {Promise<Object>} Availability status
   */
  async checkTutorAvailability(tutorId, startTime, endTime) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sessions/check-availability`,
        { tutorId, startTime, endTime },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available time slots for a tutor
   * @param {string} tutorId - Tutor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>} Available time slots
   */
  async getAvailableTimeSlots(tutorId, date) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sessions/available-slots/${tutorId}?date=${date}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reschedule a session
   * @param {string} sessionId - Session ID
   * @param {string} newStartTime - New start time
   * @param {string} newEndTime - New end time
   * @param {string} reason - Reschedule reason
   * @returns {Promise<Object>} Updated session
   */
  async rescheduleSession(sessionId, newStartTime, newEndTime, reason = "") {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/sessions/${sessionId}/reschedule`,
        { newStartTime, newEndTime, reason },
        { headers: this.getAuthHeaders() }
      );
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
          throw new Error("Session not found.");
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
   * Format session data for display
   * @param {Object} session - Raw session data
   * @returns {Object} Formatted session data
   */
  formatSessionData(session) {
    return {
      ...session,
      formattedStartTime: new Date(session.startTime).toLocaleString(),
      formattedEndTime: new Date(session.endTime).toLocaleString(),
      duration: this.calculateDuration(session.startTime, session.endTime),
      isUpcoming: new Date(session.startTime) > new Date(),
      isPast: new Date(session.endTime) < new Date(),
      canCancel: this.canCancelSession(session),
      canComplete: this.canCompleteSession(session),
      canReview: this.canReviewSession(session),
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

  /**
   * Check if session can be cancelled
   * @param {Object} session - Session data
   * @returns {boolean} Can cancel
   */
  canCancelSession(session) {
    const isUpcoming = new Date(session.startTime) > new Date();
    return isUpcoming && session.status === "scheduled";
  }

  /**
   * Check if session can be completed
   * @param {Object} session - Session data
   * @returns {boolean} Can complete
   */
  canCompleteSession(session) {
    const isPast = new Date(session.endTime) < new Date();
    return session.status === "scheduled" && isPast;
  }

  /**
   * Check if session can be reviewed
   * @param {Object} session - Session data
   * @returns {boolean} Can review
   */
  canReviewSession(session) {
    return session.status === "completed" && !session.rating;
  }
}

export default new SessionService();
