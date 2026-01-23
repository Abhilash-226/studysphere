/**
 * Helper utility to format image URLs for the application
 */

// Get the backend URL from environment or fallback
const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  // Remove /api suffix to get base backend URL
  return apiUrl.replace(/\/api$/, "");
};

/**
 * Formats an image URL to ensure it's properly accessible
 * @param {string} imageUrl - The image URL from the API response
 * @returns {string} - Properly formatted URL
 */
export const formatImageUrl = (imageUrl) => {
  if (
    !imageUrl ||
    imageUrl === "" ||
    imageUrl === "null" ||
    imageUrl === "undefined"
  ) {
    return "/images/default-avatar.png";
  }

  // Normalize path separators (convert backslashes to forward slashes)
  const normalizedUrl = imageUrl.replace(/\\/g, "/");

  // If the URL is already absolute (starts with http or https), return as is
  if (
    normalizedUrl.startsWith("http://") ||
    normalizedUrl.startsWith("https://")
  ) {
    return normalizedUrl;
  }

  // Get backend URL for uploads
  const backendUrl = getBackendUrl();

  // Handle uploads that might have been incorrectly prefixed or contain uploads path
  if (
    normalizedUrl.includes("uploads/profileImages/") ||
    normalizedUrl.includes("uploads/documents/")
  ) {
    // Extract just the uploads path
    const uploadsIndex = normalizedUrl.indexOf("uploads/");
    const cleanPath = normalizedUrl.substring(uploadsIndex);
    // Use backend URL for uploads
    const formattedUrl = backendUrl
      ? `${backendUrl}/${cleanPath}`
      : `/${cleanPath}`;
    return formattedUrl;
  }

  // If the URL is a relative path starting with 'uploads/' (after normalization)
  if (normalizedUrl.startsWith("uploads/")) {
    // Use backend URL for uploads
    const formattedUrl = backendUrl
      ? `${backendUrl}/${normalizedUrl}`
      : `/${normalizedUrl}`;
    return formattedUrl;
  }

  // If it starts with a slash, assume it's already a proper relative path
  if (normalizedUrl.startsWith("/")) {
    return normalizedUrl;
  }

  // If it's just a filename or other format, assume it's in the local public folder
  return normalizedUrl;
};

export default { formatImageUrl };
