import api from "./api.service";

class SessionService {
  // Get a session by ID
  async getSession(sessionId) {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Join a session (get classroom details, etc.)
  async joinSession(sessionId) {
    try {
      const response = await api.post(`/sessions/${sessionId}/join`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update session details (time, date, etc.)
  async updateSession(sessionId, updateData) {
    try {
      const response = await api.put(`/sessions/${sessionId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send a message in session chat
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post(`/sessions/${sessionId}/messages`, {
        content: message,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get session chat history
  async getMessages(sessionId) {
    try {
      const response = await api.get(`/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload a resource to the session
  async uploadResource(sessionId, file, description) {
    try {
      const formData = new FormData();
      formData.append("resource", file);
      formData.append("description", description);

      const response = await api.post(
        `/sessions/${sessionId}/resources`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get session resources
  async getResources(sessionId) {
    try {
      const response = await api.get(`/sessions/${sessionId}/resources`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get student's sessions
  async getStudentSessions(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get("/sessions", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tutor's sessions (teaching schedule)
  async getTutorSessions(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get("/sessions/tutor", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark session as completed (tutor action)
  async markSessionCompleted(sessionId) {
    try {
      const response = await api.patch(`/sessions/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel session (tutor or student action)
  async cancelSession(sessionId, reason = "") {
    try {
      const response = await api.patch(`/sessions/${sessionId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reschedule session
  async rescheduleSession(sessionId, newDateTime, reason = "") {
    try {
      const response = await api.patch(`/sessions/${sessionId}/reschedule`, {
        dateTime: newDateTime,
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    console.log("SessionService handleError:", error);
    if (error.response && error.response.data) {
      console.log("Error response data:", error.response.data);
      return error.response.data;
    }
    console.log("Network or unknown error:", error.message);
    return { message: "Network error or server is unavailable" };
  }
}

export default new SessionService();
