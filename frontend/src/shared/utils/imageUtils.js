/**
 * Helper utility to format image URLs for the application
 */

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
    return "/images/tutors/tutor-placeholder.svg";
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

  // Handle uploads that might have been incorrectly prefixed or contain uploads path
  if (
    normalizedUrl.includes("uploads/profileImages/") ||
    normalizedUrl.includes("uploads/documents/")
  ) {
    // Extract just the uploads path
    const uploadsIndex = normalizedUrl.indexOf("uploads/");
    const cleanPath = normalizedUrl.substring(uploadsIndex);
    // Use absolute URL to avoid React Router conflicts
    const formattedUrl = `${window.location.origin}/${cleanPath}`;
    return formattedUrl;
  }

  // If the URL is a relative path starting with 'uploads/' (after normalization)
  if (normalizedUrl.startsWith("uploads/")) {
    // Use absolute URL to avoid React Router conflicts
    const formattedUrl = `${window.location.origin}/${normalizedUrl}`;
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
