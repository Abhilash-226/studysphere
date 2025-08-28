import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaBook, FaClock, FaEnvelope, FaUserGraduate } from "react-icons/fa";
import "./StatsCards.css";

/**
 * StatsCards - Component for displaying dashboard statistics in card format
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics data to display
 * @param {number} props.stats.sessionCount - Total number of sessions
 * @param {number} props.stats.upcomingCount - Number of upcoming sessions
 * @param {number} props.stats.unreadMessages - Number of unread messages
 * @param {number} props.stats.tutorCount - Number of connected tutors
 * @returns {React.ReactElement} - Rendered component
 */
const StatsCards = ({ stats }) => {
  return (
    <Row className="stats-cards-container mb-4 g-3">
      <Col md={6} lg={3}>
        <Card className="dashboard-stat-card border-left-primary h-100">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title text-primary mb-0">Sessions</h5>
                <div className="card-subtitle text-muted mb-2">
                  Total Booked
                </div>
                <div className="stat-value">{stats.sessionCount || 0}</div>
              </div>
              <div className="stat-icon bg-primary-soft text-primary">
                <FaBook size={20} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="dashboard-stat-card border-left-success h-100">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title text-success mb-0">Upcoming</h5>
                <div className="card-subtitle text-muted mb-2">Sessions</div>
                <div className="stat-value">{stats.upcomingCount || 0}</div>
              </div>
              <div className="stat-icon bg-success-soft text-success">
                <FaClock size={20} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="dashboard-stat-card border-left-info h-100">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title text-info mb-0">Messages</h5>
                <div className="card-subtitle text-muted mb-2">Unread</div>
                <div className="stat-value">{stats.unreadMessages || 0}</div>
              </div>
              <div className="stat-icon bg-info-soft text-info">
                <FaEnvelope size={20} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="dashboard-stat-card border-left-warning h-100">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title text-warning mb-0">Tutors</h5>
                <div className="card-subtitle text-muted mb-2">Connected</div>
                <div className="stat-value">{stats.tutorCount || 0}</div>
              </div>
              <div className="stat-icon bg-warning-soft text-warning">
                <FaUserGraduate size={20} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCards;
