import React from "react";
import { Link } from "react-router-dom";
import { FaBell, FaUserCog } from "react-icons/fa";
import "./WelcomeHeader.css";

/**
 * WelcomeHeader - Component for displaying the welcome header on dashboard
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.notifications - Notification counts
 * @returns {React.ReactElement} - Rendered component
 */
const WelcomeHeader = ({ user, notifications = {} }) => {
  const { notificationCount = 0 } = notifications;

  return (
    <div className="welcome-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="mb-0">Welcome, {user?.firstName || "Student"}!</h1>
        <p className="text-muted">Your learning journey at a glance</p>
      </div>
      <div className="d-flex">
        <Link
          to="/student/notifications"
          className="btn btn-outline-secondary position-relative me-2"
        >
          <FaBell />
          {notificationCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
        <Link to="/student/profile" className="btn btn-outline-secondary">
          <FaUserCog />
        </Link>
      </div>
    </div>
  );
};

export default WelcomeHeader;
