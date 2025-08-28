import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEnvelope, FaCalendarCheck } from "react-icons/fa";
import tutorChatService from "../../../shared/services/tutor-chat.service";
import ErrorBoundary from "../../../shared/components/ErrorBoundary/ErrorBoundary";

const MessagesSummaryContent = () => {
  const [stats, setStats] = useState({
    unreadCount: 0,
    totalConversations: 0,
    responseRate: 0,
    averageResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await tutorChatService.getTutorMessageStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error("Error fetching message stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Message Center</Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-bg bg-primary text-white rounded-circle p-3 me-3">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h6 className="mb-0">Unread Messages</h6>
                {loading ? (
                  <p className="mb-0">Loading...</p>
                ) : (
                  <p className="mb-0">{stats.unreadCount} messages</p>
                )}
              </div>
            </div>
          </Col>

          <Col md={6} className="mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-bg bg-success text-white rounded-circle p-3 me-3">
                <FaCalendarCheck size={24} />
              </div>
              <div>
                <h6 className="mb-0">Response Rate</h6>
                {loading ? (
                  <p className="mb-0">Loading...</p>
                ) : (
                  <p className="mb-0">{stats.responseRate}%</p>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <div className="text-center mt-3">
          <Link to="/tutor/messages">
            <Button variant="primary">View All Messages</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

// Wrap with error boundary
const MessagesSummaryCard = () => (
  <ErrorBoundary resetOnError={false}>
    <MessagesSummaryContent />
  </ErrorBoundary>
);

export default MessagesSummaryCard;
