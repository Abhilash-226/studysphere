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
      let requestData = profileData;
      let headers = {};

      // Check if profileData is already FormData or contains files
      if (!(profileData instanceof FormData)) {
        // Check if there are any File objects in the data
        const hasFiles = Object.values(profileData).some(
          (value) => value instanceof File
        );

        if (hasFiles) {
          // Convert to FormData if there are files
          const formData = new FormData();
          Object.entries(profileData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });
          requestData = formData;
          headers["Content-Type"] = "multipart/form-data";
        } else {
          // Use JSON for regular data without files
          headers["Content-Type"] = "application/json";
        }
      } else {
        // Already FormData
        headers["Content-Type"] = "multipart/form-data";
      }

      const response = await api.put("/tutors/profile", requestData, {
        headers,
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

      // Extract the sessions array from the response structure
      const sessions =
        response.data?.sessions || response.data?.data || response.data || [];

      return sessions;
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

  // Get tutor dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get("/tutors/dashboard-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values if API fails
      return {
        totalSessions: 0,
        totalHours: 0,
        totalStudents: 0,
        completedSessions: 0,
        pendingRequests: 0,
        averageRating: 0,
      };
    }
  }

  // Get tutor notification count
  async getNotificationCount() {
    try {
      const response = await api.get("/tutors/notifications/count");
      return response.data?.count || 0;
    } catch (error) {
      console.error("Error fetching notification count:", error);
      return 0;
    }
  }

  // Get pending session requests count
  async getPendingRequestsCount() {
    try {
      const response = await api.get("/tutors/session-requests/count");
      return response.data?.count || 0;
    } catch (error) {
      console.error("Error fetching pending requests count:", error);
      return 0;
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
        if (Array.isArray(filters.subjects)) {
          filters.subjects.forEach((subject) => {
            queryParams.append("subjects", subject);
          });
        } else {
          queryParams.append("subjects", filters.subjects);
        }
      }

      if (filters.location) {
        if (Array.isArray(filters.location)) {
          filters.location.forEach((loc) => {
            queryParams.append("location", loc);
          });
        } else {
          queryParams.append("location", filters.location);
        }
      } else if (filters.locations) {
        if (Array.isArray(filters.locations)) {
          filters.locations.forEach((loc) => {
            queryParams.append("location", loc);
          });
        } else {
          queryParams.append("location", filters.locations);
        }
      }

      // Handle experience range filter
      if (filters.experience) {
        if (
          Array.isArray(filters.experience) &&
          filters.experience.length === 2
        ) {
          queryParams.append("minExperience", filters.experience[0]);
          queryParams.append("maxExperience", filters.experience[1]);
        } else if (filters.minExperience) {
          queryParams.append("minExperience", filters.minExperience);
        }
      }

      // Handle price range filter
      if (filters.price) {
        if (Array.isArray(filters.price) && filters.price.length === 2) {
          queryParams.append("minPrice", filters.price[0]);
          queryParams.append("maxPrice", filters.price[1]);
        }
      } else {
        if (filters.minPrice) {
          queryParams.append("minPrice", filters.minPrice);
        }
        if (filters.maxPrice) {
          queryParams.append("maxPrice", filters.maxPrice);
        }
      }

      // Handle rating filter
      if (filters.rating) {
        if (Array.isArray(filters.rating) && filters.rating.length > 0) {
          // Get the minimum rating from selected ratings
          const minRating = Math.min(...filters.rating.map((r) => parseInt(r)));
          queryParams.append("minRating", minRating);
        }
      } else if (filters.minRating) {
        queryParams.append("minRating", filters.minRating);
      }

      if (filters.day) {
        queryParams.append("day", filters.day);
      }

      if (filters.gender) {
        if (Array.isArray(filters.gender)) {
          filters.gender.forEach((gender) => {
            queryParams.append("gender", gender);
          });
        } else {
          queryParams.append("gender", filters.gender);
        }
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
