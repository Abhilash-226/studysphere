import React from "react";
import { Link } from "react-router-dom";
import { FaUserCog } from "react-icons/fa";
import "./WelcomeHeader.css";

/**
 * WelcomeHeader - Component for displaying the welcome header on dashboard
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @returns {React.ReactElement} - Rendered component
 */
const WelcomeHeader = ({ user }) => {
  return (
    <div className="welcome-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="mb-0">Welcome, {user?.firstName || "Student"}!</h1>
        <p className="text-muted">Your learning journey at a glance</p>
      </div>
      <div className="d-flex">
        <Link to="/student/profile" className="btn btn-outline-secondary">
          <FaUserCog />
        </Link>
      </div>
    </div>
  );
};

export default WelcomeHeader;
