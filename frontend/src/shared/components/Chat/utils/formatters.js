/**
 * Chat utility functions for formatting dates, times and handling user data
 */

/**
 * Format timestamp to time (HH:MM)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time (HH:MM)
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

/**
 * Format timestamp to date (Month Day, Year if not current year)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format conversation time for list display (Today: time, This week: day name, Older: date)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted relative time
 */
export const formatConversationTime = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    const now = new Date();

    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's this week, show day name
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    // Otherwise show date
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (error) {
    console.error("Error formatting conversation time:", error);
    return "";
  }
};

/**
 * Format user name consistently from various data sources
 * @param {Object} user - User data object
 * @returns {string} Formatted user name
 */
export const formatUserName = (user) => {
  if (!user) return "Unknown User";

  // If name is already present, use it
  if (user.name && user.name.trim() !== "") return user.name;

  // Otherwise construct from firstName and lastName
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return fullName || "Unknown User";
};
/**
 * Normalize user object to have consistent properties
 * @param {Object} user - User data object
 * @returns {Object} Normalized user object
 */
export const normalizeUserObject = (user) => {
  if (!user) {
    return {
      id: "unknown",
      name: "Unknown User",
      profileImage: "",
      email: "",
      role: "unknown",
    };
  }

  return {
    id: user.id || user._id || "unknown",
    name: formatUserName(user),
    profileImage: user.profileImage || "",
    email: user.email || "",
    role: user.role || "unknown",
  };
};

/**
 * Cache user information in local storage for consistent display
 * @param {Object} user - User data object
 */
export const cacheUserInfo = (user) => {
  if (!user || !user.id) return;

  const normalizedUser = normalizeUserObject(user);
  localStorage.setItem(
    `chat_user_${normalizedUser.id}`,
    JSON.stringify(normalizedUser)
  );
};

/**
 * Get cached user information from local storage
 * @param {string} userId - User ID
 * @returns {Object|null} User data object or null if not found
 */
export const getCachedUserInfo = (userId) => {
  if (!userId) return null;

  try {
    const userData = localStorage.getItem(`chat_user_${userId}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting cached user info:", error);
    return null;
  }
};
