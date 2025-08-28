/**
 * Helper utility to format image URLs for the application
 */

/**
 * Formats an image URL to ensure it's properly accessible
 * @param {string} imageUrl - The image URL from the API response
 * @returns {string} - Properly formatted URL
 */
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "/images/tutors/tutor-placeholder.svg";
  }

  // If the URL is already absolute (starts with http or https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If the URL is a relative path starting with 'uploads/'
  if (imageUrl.startsWith("uploads/")) {
    // Use relative URL with the Vite proxy
    return `/${imageUrl}`;
  }

  // If it's just a filename or other format, assume it's in the local public folder
  return imageUrl;
};

export default { formatImageUrl };
