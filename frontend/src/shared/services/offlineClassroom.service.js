import api from "./api.service";

/**
 * Offline Classroom Marketplace Service
 * Handles API calls for browsing and managing physical classrooms
 */
class OfflineClassroomService {
  /**
   * Get all classrooms with filters
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Classrooms list with pagination
   */
  async getClassrooms(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.city) queryParams.append("city", params.city);
      if (params.pincode) queryParams.append("pincode", params.pincode);
      if (params.area) queryParams.append("area", params.area);
      if (params.subjects) queryParams.append("subjects", params.subjects);
      if (params.minFee) queryParams.append("minFee", params.minFee);
      if (params.maxFee) queryParams.append("maxFee", params.maxFee);
      if (params.batchType) queryParams.append("batchType", params.batchType);
      if (params.days) queryParams.append("days", params.days);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const response = await api.get(
        `/offline-classrooms?${queryParams.toString()}`,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get classroom by ID or slug
   * @param {string} id - Classroom ID or slug
   * @returns {Promise<Object>} Classroom details
   */
  async getClassroomById(id) {
    try {
      const response = await api.get(`/offline-classrooms/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get unique cities for filter
   * @returns {Promise<Array>} List of cities
   */
  async getCities() {
    try {
      const response = await api.get("/offline-classrooms/cities");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get unique subjects for filter
   * @returns {Promise<Array>} List of subjects
   */
  async getSubjects() {
    try {
      const response = await api.get("/offline-classrooms/subjects");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Record an inquiry when user views contact info
   * @param {string} id - Classroom ID
   * @returns {Promise<Object>} Response
   */
  async recordInquiry(id) {
    try {
      const response = await api.post(`/offline-classrooms/${id}/inquiry`);
      return response.data;
    } catch (error) {
      // Silent fail for analytics
      return { success: false };
    }
  }

  // ============ TUTOR METHODS ============

  /**
   * Get tutor's own classrooms
   * @returns {Promise<Object>} List of tutor's classrooms
   */
  async getMyClassrooms() {
    try {
      const response = await api.get("/offline-classrooms/tutor/my-classrooms");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new classroom
   * @param {Object} classroomData - Classroom details
   * @returns {Promise<Object>} Created classroom
   */
  async createClassroom(classroomData) {
    try {
      const response = await api.post("/offline-classrooms", classroomData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a classroom
   * @param {string} id - Classroom ID
   * @param {Object} classroomData - Updated data
   * @returns {Promise<Object>} Updated classroom
   */
  async updateClassroom(id, classroomData) {
    try {
      const response = await api.put(
        `/offline-classrooms/${id}`,
        classroomData,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle classroom status
   * @param {string} id - Classroom ID
   * @param {string} status - New status (active/inactive/paused)
   * @returns {Promise<Object>} Response
   */
  async toggleStatus(id, status) {
    try {
      const response = await api.patch(`/offline-classrooms/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a classroom
   * @param {string} id - Classroom ID
   * @returns {Promise<Object>} Response
   */
  async deleteClassroom(id) {
    try {
      const response = await api.delete(`/offline-classrooms/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload classroom images
   * @param {File[]} files - Array of image files
   * @returns {Promise<Object>} Response with image URLs
   */
  async uploadClassroomImages(files) {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await api.post(
        "/offline-classrooms/upload-images",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Object} Formatted error
   */
  handleError(error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: "Network error or server is unavailable",
    };
  }
}

export default new OfflineClassroomService();
