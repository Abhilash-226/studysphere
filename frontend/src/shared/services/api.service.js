import axios from "axios";

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the authorization token to every request
api.interceptors.request.use(
  (config) => {
    // First try to get token directly from localStorage
    let token = localStorage.getItem("token");

    // If not found, check if it's stored in the user object
    if (!token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            token = user.token;
          }
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Check user role to redirect to appropriate login page
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.role === "tutor") {
            window.location.href = "/login-tutor";
            return Promise.reject(error);
          }
        }
      } catch (err) {
        console.error("Error parsing user during logout:", err);
      }

      // Default to student login
      window.location.href = "/login-student";
    } else if (error.response && error.response.status === 403) {
      console.error("Permission denied (403):", error.response.data);
      console.error("Request details:", {
        url: error.config.url,
        method: error.config.method,
        hasAuthHeader: !!error.config.headers.Authorization,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
