import api from "./api.service";

class TutorService {
  // Get tutor profile
  async getProfile() {
    try {
      const response = await api.get("/tutors/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update tutor profile
  async updateProfile(profileData) {
    try {
      // FormData is already passed from the profile setup component
      const response = await api.put("/tutors/profile", profileData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload or update profile image
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.post(
        "/tutors/upload-profile-image",
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

  // Get tutor by ID
  async getTutorById(id) {
    try {
      const response = await api.get(`/tutors/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Set tutor availability
  async setAvailability(availabilityData) {
    try {
      const response = await api.post("/tutors/availability", availabilityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tutor's scheduled sessions
  async getScheduledSessions(status = "all") {
    try {
      const response = await api.get(`/tutors/sessions?status=${status}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Accept a session request
  async acceptSession(sessionId) {
    try {
      const response = await api.put(`/sessions/${sessionId}/accept`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reject a session request
  async rejectSession(sessionId, reason) {
    try {
      const response = await api.put(`/sessions/${sessionId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete a session
  async completeSession(sessionId, notes) {
    try {
      const response = await api.put(`/sessions/${sessionId}/complete`, {
        notes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get verification status
  async getVerificationStatus() {
    try {
      const response = await api.get("/tutors/verification-status");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tutor verification status
  async getVerificationStatus() {
    try {
      const response = await api.get("/tutors/verification-status");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get featured tutors for homepage
  async getFeaturedTutors(limit = 4) {
    try {
      const response = await api.get(`/tutors/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all tutors (paginated with filtering)
  async getAllTutors(
    page = 1,
    limit = 10,
    filters = {},
    sort = "rating",
    order = "desc"
  ) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        sort,
        order,
      });

      // Add filter parameters if they exist
      if (filters.teachingMode) {
        if (Array.isArray(filters.teachingMode)) {
          filters.teachingMode.forEach((mode) => {
            queryParams.append("teachingMode", mode);
          });
        } else {
          queryParams.append("teachingMode", filters.teachingMode);
        }
      }

      if (filters.subjects) {
        queryParams.append("subjects", filters.subjects);
      }

      if (filters.location) {
        queryParams.append("location", filters.location);
      }

      if (filters.minExperience) {
        queryParams.append("minExperience", filters.minExperience);
      }

      if (filters.minPrice) {
        queryParams.append("minPrice", filters.minPrice);
      }

      if (filters.maxPrice) {
        queryParams.append("maxPrice", filters.maxPrice);
      }

      if (filters.minRating) {
        queryParams.append("minRating", filters.minRating);
      }

      if (filters.day) {
        queryParams.append("day", filters.day);
      }

      const response = await api.get(`/tutors?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
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

export default new TutorService();
