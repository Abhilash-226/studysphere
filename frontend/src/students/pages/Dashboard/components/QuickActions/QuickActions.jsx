import React from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaCalendarCheck,
  FaEnvelope,
  FaHistory,
  FaGraduationCap,
  FaUserEdit,
  FaChevronRight,
} from "react-icons/fa";
import "./QuickActions.css";

/**
 * QuickActions - Component for displaying quick action buttons on dashboard
 * @param {Object} props - Component props
 * @param {Object} props.messageStats - Message statistics
 * @param {number} props.unreadMessageCount - Number of unread messages
 * @returns {React.ReactElement} - Rendered component
 */
const QuickActions = ({ messageStats, unreadMessageCount = 0 }) => {
  const quickActionItems = [
    {
      icon: <FaSearch />,
      title: "Find Tutors",
      description: "Browse available tutors",
      link: "/tutors",
      color: "primary",
    },
    {
      icon: <FaCalendarCheck />,
      title: "Book Session",
      description: "Schedule a new session",
      link: "/student/book-session",
      color: "success",
    },
    {
      icon: <FaEnvelope />,
      title: "Messages",
      description: "View your conversations",
      link: "/student/chat",
      color: "info",
      badge: unreadMessageCount > 0 ? unreadMessageCount : null,
    },
    {
      icon: <FaHistory />,
      title: "Session History",
      description: "Review past sessions",
      link: "/student/sessions/history",
      color: "secondary",
    },
    {
      icon: <FaGraduationCap />,
      title: "Resources",
      description: "Access learning materials",
      link: "/student/resources",
      color: "warning",
    },
    {
      icon: <FaUserEdit />,
      title: "Edit Profile",
      description: "Update your information",
      link: "/student/profile",
      color: "dark",
    },
  ];

  return (
    <Card className="quick-actions-card shadow-sm mb-4">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0">Quick Actions</h5>
      </Card.Header>
      <Card.Body className="p-3">
        <div className="quick-actions-list">
          {quickActionItems.map((item, index) => (
            <Link
              to={item.link}
              className={`quick-action-row bg-${item.color}-soft text-${item.color}`}
              key={index}
            >
              <div className="quick-action-icon">{item.icon}</div>
              <div className="quick-action-content">
                <h6 className="quick-action-title mb-0">{item.title}</h6>
                <p className="quick-action-description mb-0">
                  {item.description}
                </p>
              </div>
              <div className="quick-action-arrow">
                <FaChevronRight />
              </div>
              {item.badge && (
                <Badge pill bg="danger" className="quick-action-badge">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuickActions;
