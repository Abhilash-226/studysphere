import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import "./TutorVerificationPending.css";

/**
 * TutorVerificationPending - Component for verification pending page
 * @returns {React.ReactElement} - Rendered component
 */
const TutorVerificationPending = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0 rounded-lg verification-card">
            <Card.Body className="p-5 text-center">
              <div className="verification-icon mb-4">
                <FaHourglassHalf size={64} className="text-warning" />
              </div>

              <h2 className="mb-4">Verification Pending</h2>

              <p className="lead mb-4">
                Thank you for signing up as a tutor with StudySphere!
              </p>

              <p className="mb-4">
                Your account is currently under verification. Our team will
                review your credentials and identity documents to ensure the
                safety and quality of our platform.
              </p>

              <Card className="bg-light border-0 mb-4">
                <Card.Body>
                  <h5>
                    <FaClock className="me-2 text-secondary" /> What to expect
                  </h5>
                  <ul className="text-start">
                    <li>Verification typically takes 1-2 business days</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>Additional documents may be requested if needed</li>
                  </ul>
                </Card.Body>
              </Card>

              <Card className="bg-light border-0 mb-4">
                <Card.Body>
                  <h5>
                    <FaCheckCircle className="me-2 text-success" /> Next Steps
                    After Verification
                  </h5>
                  <ul className="text-start">
                    <li>Log in to your tutor account</li>
                    <li>Complete your profile with teaching preferences</li>
                    <li>Set your availability schedule</li>
                    <li>Start receiving student requests for sessions</li>
                  </ul>
                </Card.Body>
              </Card>

              <p className="mb-4">
                If you have any questions or need assistance, please contact our
                support team.
              </p>

              <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
                <Button as={Link} to="/" variant="outline-primary">
                  Return to Homepage
                </Button>
                <Button
                  as="a"
                  href="mailto:support@studysphere.com"
                  variant="outline-secondary"
                >
                  <FaEnvelope className="me-2" /> Contact Support
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TutorVerificationPending;
