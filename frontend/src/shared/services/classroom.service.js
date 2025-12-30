/**
 * Classroom Service
 * Handles API calls for online classroom functionality
 */

import api from "./api.service";

const classroomService = {
  /**
   * Start a class (Tutor only)
   * @param {string} sessionId - The session ID
   */
  startClass: async (sessionId) => {
    try {
      const response = await api.post(`/classroom/${sessionId}/start`);
      return response.data;
    } catch (error) {
      console.error("Error starting class:", error);
      throw error.response?.data || { message: "Failed to start class" };
    }
  },

  /**
   * Join a class
   * @param {string} sessionId - The session ID
   */
  joinClass: async (sessionId) => {
    try {
      const response = await api.post(`/classroom/${sessionId}/join`);
      return response.data;
    } catch (error) {
      console.error("Error joining class:", error);
      throw error.response?.data || { message: "Failed to join class" };
    }
  },

  /**
   * End a class (Tutor only)
   * @param {string} sessionId - The session ID
   */
  endClass: async (sessionId) => {
    try {
      const response = await api.post(`/classroom/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error("Error ending class:", error);
      throw error.response?.data || { message: "Failed to end class" };
    }
  },

  /**
   * Get class status
   * @param {string} sessionId - The session ID
   */
  getClassStatus: async (sessionId) => {
    try {
      const response = await api.get(`/classroom/${sessionId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error getting class status:", error);
      throw error.response?.data || { message: "Failed to get class status" };
    }
  },
};

export default classroomService;
