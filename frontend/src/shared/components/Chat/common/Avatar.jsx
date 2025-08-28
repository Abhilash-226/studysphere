import React from "react";
import PropTypes from "prop-types";
import "./ChatComponents.css";

/**
 * Avatar component for displaying user profile images
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for the image
 * @param {string} props.size - Size of avatar ('sm', 'md', 'lg')
 * @param {string} props.status - Online status ('online', 'offline', 'away')
 */
const Avatar = ({ src, alt, size = "md", status }) => {
  const defaultImage = "/images/tutors/tutor-placeholder.svg";

  return (
    <div className={`chat-avatar chat-avatar-${size}`}>
      <img
        src={src || defaultImage}
        alt={alt || "User"}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultImage;
        }}
      />
      {status && <span className={`status-indicator status-${status}`} />}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  status: PropTypes.oneOf(["online", "offline", "away"]),
};

export default Avatar;
