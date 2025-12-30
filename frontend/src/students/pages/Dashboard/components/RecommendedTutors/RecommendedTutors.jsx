import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaStar } from "react-icons/fa";
import { formatImageUrl } from "../../../../../shared/utils/imageUtils";
import "./RecommendedTutors.css";

/**
 * RecommendedTutors - Component for displaying recommended tutors
 * @param {Object} props - Component props
 * @param {Array} props.tutors - Array of recommended tutor objects
 * @returns {React.ReactElement} - Rendered component
 */
const RecommendedTutors = ({ tutors }) => {
  return (
    <Card className="recommended-tutors-card mb-4">
      <Card.Header className="bg-white">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <FaGraduationCap className="text-primary me-2" />
            <h5 className="mb-0">Recommended Tutors</h5>
          </div>
          <Link to="/tutors" className="btn btn-sm btn-outline-primary">
            Browse All
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        {tutors && tutors.length > 0 ? (
          <Row className="g-3">
            {tutors.map((tutor, index) => (
              <Col md={6} key={index}>
                <Card className="tutor-card h-100">
                  <Card.Body>
                    <div className="d-flex mb-3">
                      <div className="tutor-avatar me-3">
                        <img
                          src={
                            formatImageUrl(tutor.profileImage) ||
                            "/default-avatar.png"
                          }
                          alt={tutor.name}
                        />
                      </div>
                      <div>
                        <h6 className="mb-1">{tutor.name}</h6>
                        <div className="rating-stars mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.floor(tutor.rating || 0)
                                  ? "text-warning"
                                  : "text-muted"
                              }
                            />
                          ))}
                          <span className="rating-number">
                            {tutor.rating?.toFixed(1) || "New"}
                          </span>
                        </div>
                        <p className="small mb-1">
                          <strong>Subjects:</strong>{" "}
                          {tutor.subjects?.slice(0, 3).join(", ")}
                          {tutor.subjects?.length > 3 ? "..." : ""}
                        </p>
                        <p className="small mb-0">
                          <strong>Rate:</strong> ₹{tutor.hourlyRate}/hr
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        as={Link}
                        to={`/tutors/${tutor.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                      >
                        View Profile
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <p className="mb-3 text-muted">
              We're personalizing recommendations based on your learning
              preferences
            </p>
            <Button as={Link} to="/tutors" variant="primary">
              Browse Tutors
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecommendedTutors;
