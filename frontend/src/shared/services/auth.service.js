import api from "./api.service";

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        // Store token both directly and within the user object
        localStorage.setItem("token", response.data.token);

        // Make sure the user object also contains the token
        const userObj = response.data.user || {};
        userObj.token = response.data.token;

        localStorage.setItem("user", JSON.stringify(userObj));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login a user
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        // Store token both directly and within the user object to support both approaches
        localStorage.setItem("token", response.data.token);

        // Make sure the user object also contains the token
        const userData = response.data.user || {};
        userData.token = response.data.token;

        localStorage.setItem("user", JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout the current user
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Get the current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    // Try both methods to check if user is logged in
    const hasDirectToken = !!localStorage.getItem("token");

    if (hasDirectToken) return true;

    // If no direct token, check the user object
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload ID document for tutor verification
  async uploadIdDocument(file) {
    try {
      const formData = new FormData();
      formData.append("idDocument", file);

      const response = await api.post("/auth/upload-id", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload qualification document for tutor verification
  async uploadQualificationDocument(file) {
    try {
      const formData = new FormData();
      formData.append("qualificationDocument", file);

      const response = await api.post("/auth/upload-qualification", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Request password reset
  async forgotPassword(email) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password with token
  async resetPassword(token, password) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response && error.response.data) {
      // API error with response
      return error.response.data;
    }
    // Network error or other issues
    return { message: "Network error or server is unavailable" };
  }
}

export default new AuthService();
