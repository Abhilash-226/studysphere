import api from "./api.service";

class StudentService {
  // Get student profile
  async getProfile() {
    try {
      const response = await api.get("/students/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update student profile
  async updateProfile(profileData) {
    try {
      const response = await api.put("/students/profile", profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available sessions/tutors
  async getAvailableTutors(filters = {}) {
    try {
      const response = await api.get("/students/available-tutors", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Book a session with a tutor
  async bookSession(sessionData) {
    try {
      const response = await api.post("/sessions", sessionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get student's booked sessions
  async getBookedSessions(status = "all") {
    try {
      const response = await api.get(`/students/sessions?status=${status}`);

      // Extract the data array from the response structure
      const sessions = response.data?.data || response.data || [];

      return sessions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel a session
  async cancelSession(sessionId, reason) {
    try {
      const response = await api.put(`/sessions/${sessionId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Rate and review a completed session
  async rateSession(sessionId, rating, review) {
    try {
      const response = await api.post(`/sessions/${sessionId}/review`, {
        rating,
        review,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get recommended tutors for the student
  async getRecommendedTutors() {
    try {
      const response = await api.get("/students/recommended-tutors");
      return response.data?.data || response.data || [];
    } catch (error) {
      // Return empty array as fallback
      return [];
    }
  }

  // Get student dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get("/students/dashboard-stats");
      return response.data;
    } catch (error) {
      return {
        totalSessions: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        totalTutors: 0,
        favoriteSubjects: [],
      };
    }
  }

  // Get total count of available tutors
  async getTutorCount() {
    try {
      const response = await api.get("/students/tutor-count");
      return response.data?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  // Get notification count for student
  async getNotificationCount() {
    try {
      const response = await api.get("/students/notifications/count");
      return response.data?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  // Error handler
  handleError(error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { message: "Network error or server is unavailable" };
  }
}

export default new StudentService();
