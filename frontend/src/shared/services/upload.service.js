import api from "./api.service";

class UploadService {
  /**
   * Upload profile image for the current user
   * @param {File} file - The image file to upload
   * @returns {Promise} Response from the server
   */
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.post("/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Profile image upload error:", error);
      throw error;
    }
  }

  /**
   * Get the full URL for a profile image
   * @param {string} imagePath - The relative path to the image
   * @returns {string} Full URL to the image
   */
  getImageUrl(imagePath) {
    try {
      if (!imagePath || imagePath === "" || imagePath.includes("undefined")) {
        return "/images/avatar-placeholder.jpg";
      }

      // If it's already a full URL or starts with /images, return as is
      if (imagePath.startsWith("http") || imagePath.startsWith("/images/")) {
        return imagePath;
      }

      // Otherwise, construct the full URL
      const normalizedPath = imagePath.replace(/\\/g, "/");
      let apiUrl;

      try {
        apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      } catch (error) {
        // Fallback if import.meta.env is not available
        apiUrl = "http://localhost:5000";
      }

      return `${apiUrl}/${normalizedPath}`;
    } catch (error) {
      console.warn("Error processing image URL:", error);
      return "/images/avatar-placeholder.jpg";
    }
  }
  /**
   * Validate image file before upload
   * @param {File} file - The file to validate
   * @returns {object} Validation result
   */
  validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (!file) {
      return { isValid: false, error: "No file selected" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Please select a JPEG, PNG, or GIF image.",
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size too large. Please select an image under 5MB.",
      };
    }

    return { isValid: true };
  }

  /**
   * Debug method to help troubleshoot image issues
   * @param {string} imagePath - The image path to debug
   */
  debugImagePath(imagePath) {
    console.log("Debug Image Path:", {
      original: imagePath,
      processed: this.getImageUrl(imagePath),
      apiUrl: import.meta.env.VITE_API_URL,
      environment: import.meta.env.MODE,
    });
  }
}

export default new UploadService();
