import React from "react";
import PropTypes from "prop-types";
import { formatImageUrl } from "../../../utils/imageUtils";
import "./ChatComponents.css";

/**
 * Avatar component for displaying user profile images
 * Enhanced with better fallback handling and Bootstrap integration
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for the image
 * @param {string} props.size - Size of avatar ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showOnlineStatus - Whether to show online status indicator
 * @param {boolean} props.isOnline - Whether the user is online
 * @param {string} props.fallbackText - Custom fallback text instead of generated initials
 * @param {string} props.status - Online status ('online', 'offline', 'away') - deprecated, use isOnline
 */
const Avatar = ({
  src,
  alt,
  size = "md",
  className = "",
  onClick,
  showOnlineStatus = false,
  isOnline = false,
  fallbackText,
  status, // deprecated but kept for backward compatibility
  ...props
}) => {
  // Size configurations for both custom and Bootstrap classes
  const sizeMap = {
    xs: { width: "24px", height: "24px", fontSize: "10px", bsSize: "24px" },
    sm: { width: "32px", height: "32px", fontSize: "12px", bsSize: "32px" },
    md: { width: "40px", height: "40px", fontSize: "14px", bsSize: "40px" },
    lg: { width: "56px", height: "56px", fontSize: "18px", bsSize: "56px" },
    xl: { width: "80px", height: "80px", fontSize: "24px", bsSize: "80px" },
  };

  const sizeStyle = sizeMap[size] || sizeMap.md;

  // Format the image URL using our utility
  const imageUrl = src ? formatImageUrl(src) : null;
  const defaultImage = "/images/tutors/tutor-placeholder.svg";

  // Generate fallback text from alt text or provided fallback
  const generateFallbackText = () => {
    const text = fallbackText || alt || "?";
    if (text.length > 1) {
      // Extract initials from name
      const words = text.split(" ");
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return text.substring(0, 2).toUpperCase();
    }
    return text.toUpperCase();
  };

  const handleImageError = (e) => {
    // Try default image first, then show fallback text
    if (e.target.src !== defaultImage) {
      e.target.src = defaultImage;
    } else {
      // Hide the image and show fallback
      e.target.style.display = "none";
      if (e.target.nextSibling) {
        e.target.nextSibling.style.display = "flex";
      }
    }
  };

  const handleImageLoad = (e) => {
    // Show the image and hide fallback
    e.target.style.display = "block";
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = "none";
    }
  };

  // Determine online status (new prop takes precedence over deprecated status prop)
  const isUserOnline = showOnlineStatus && (isOnline || status === "online");
  const userStatus = status || (isOnline ? "online" : "offline");

  const avatarClasses = [
    "chat-avatar",
    `chat-avatar-${size}`,
    "position-relative",
    "d-inline-block",
    className,
    onClick ? "cursor-pointer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={avatarClasses}
      style={{
        width: sizeStyle.width,
        height: sizeStyle.height,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
      {...props}
    >
      {/* Image */}
      <img
        src={imageUrl || defaultImage}
        alt={alt || "User"}
        className="rounded-circle"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />

      {/* Fallback text */}
      <div
        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
        style={{
          width: "100%",
          height: "100%",
          fontSize: sizeStyle.fontSize,
          display: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {generateFallbackText()}
      </div>

      {/* Status indicator */}
      {(showOnlineStatus || status) && (
        <span
          className={`status-indicator status-${userStatus} position-absolute rounded-circle border border-2 border-white`}
          style={{
            width: size === "xs" ? "8px" : size === "sm" ? "10px" : "12px",
            height: size === "xs" ? "8px" : size === "sm" ? "10px" : "12px",
            bottom: "0",
            right: "0",
          }}
          title={isUserOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  /** Source URL for the avatar image */
  src: PropTypes.string,
  /** Alt text for the avatar */
  alt: PropTypes.string,
  /** Size of the avatar */
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Click handler */
  onClick: PropTypes.func,
  /** Whether to show online status indicator */
  showOnlineStatus: PropTypes.bool,
  /** Whether the user is online */
  isOnline: PropTypes.bool,
  /** Custom fallback text instead of generated initials */
  fallbackText: PropTypes.string,
  /** @deprecated Use isOnline instead */
  status: PropTypes.oneOf(["online", "offline", "away"]),
};

export default Avatar;
