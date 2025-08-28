// Utility functions for error handling

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Additional error details
 * @returns {Object} Error object
 */
exports.createError = (message, statusCode = 500, details = null) => {
  return {
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handles errors in async controllers
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function with error handling
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Server error occurred",
      error: process.env.NODE_ENV === "development" ? err : undefined,
    });
  });
};
