import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUsers, FaUser, FaEye, FaGraduationCap } from "react-icons/fa";
import studentProfileService from "../../../../../shared/services/studentProfile.service";
import { formatImageUrl } from "../../../../../shared/utils/imageUtils";
import "./MyStudentsSection.css";

/**
 * MyStudentsSection - Component for displaying tutor's students
 * @param {Object} props - Component props
 * @returns {React.ReactElement} - Rendered component
 */
const MyStudentsSection = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyStudents();
  }, []);

  const loadMyStudents = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getMyStudents();

      if (response.success) {
        setStudents(response.students || []);
      } else {
        setError(response.message || "Failed to load students");
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FaUsers className="me-2 text-primary" />
            <h5 className="mb-0">My Students</h5>
          </div>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaUsers className="me-2 text-primary" />
          <h5 className="mb-0">My Students</h5>
        </div>
        <Badge bg="primary" pill>
          {students.length}
        </Badge>
      </Card.Header>

      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {students.length === 0 ? (
          <div className="text-center py-4">
            <FaUsers size={48} className="text-muted mb-3" />
            <h6>No Students Yet</h6>
            <p className="text-muted">
              You haven't taught any students yet. Students will appear here
              after your first session.
            </p>
          </div>
        ) : (
          <Row>
            {students.slice(0, 6).map((student) => (
              <Col md={6} lg={4} key={student.id} className="mb-3">
                <div className="student-card">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={formatImageUrl(student.profileImage)}
                      alt={student.name}
                      className="student-avatar me-3"
                      onError={(e) => {
                        e.target.src = "/images/default-avatar.png";
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{student.name}</h6>
                      <div className="d-flex align-items-center">
                        <FaGraduationCap
                          className="me-1 text-muted"
                          size={12}
                        />
                        <small className="text-muted">
                          {student.grade || "Grade not specified"}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    {student.school && (
                      <div className="mb-1">
                        <small className="text-muted">{student.school}</small>
                      </div>
                    )}

                    {student.subjects && student.subjects.length > 0 && (
                      <div className="mb-2">
                        {student.subjects.slice(0, 2).map((subject, index) => (
                          <Badge
                            key={index}
                            bg="light"
                            text="dark"
                            className="me-1"
                          >
                            {subject}
                          </Badge>
                        ))}
                        {student.subjects.length > 2 && (
                          <Badge bg="secondary" text="white">
                            +{student.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Last session: {formatDate(student.lastSession)}
                      </small>
                      <div className="profile-completion">
                        <small className="text-muted">
                          Profile: {student.profileCompleteness}%
                        </small>
                      </div>
                    </div>
                  </div>

                  <Button
                    as={Link}
                    to={`/tutor/student/${student.id}`}
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                  >
                    <FaEye className="me-1" />
                    View Profile
                  </Button>
                </div>
              </Col>
            ))}

            {students.length > 6 && (
              <Col xs={12} className="text-center">
                <Button variant="outline-primary" className="mt-2">
                  View All Students ({students.length})
                </Button>
              </Col>
            )}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyStudentsSection;
