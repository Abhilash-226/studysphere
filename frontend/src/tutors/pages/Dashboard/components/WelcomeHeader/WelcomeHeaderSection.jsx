import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaUserCog } from "react-icons/fa";
import "./WelcomeHeaderSection.css";

/**
 * WelcomeHeaderSection - Header section of the tutor dashboard with welcome message and action buttons
 * @param {Object} props - Component props
 * @param {Object} props.user - User information
 * @param {Object} props.messageStats - Message statistics
 * @returns {React.ReactElement} - Rendered component
 */
const WelcomeHeaderSection = ({ user, messageStats }) => {
  const firstName = user?.firstName || "Tutor";

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="mb-0">Welcome, {firstName}!</h1>
        <p className="text-muted">
          Here's what's happening with your tutoring today
        </p>
      </div>
      <div className="d-flex">
        <Link
          to="/tutor/chat"
          className="btn btn-outline-secondary position-relative me-2"
        >
          <FaEnvelope />
          {messageStats?.unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {messageStats.unreadCount}
              <span className="visually-hidden">unread messages</span>
            </span>
          )}
        </Link>
        <Link to="/tutor/profile" className="btn btn-outline-primary">
          <FaUserCog className="me-1" /> Profile
        </Link>
      </div>
    </div>
  );
};

export default WelcomeHeaderSection;
