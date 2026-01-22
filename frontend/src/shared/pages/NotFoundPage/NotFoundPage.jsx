import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaArrowLeft } from "react-icons/fa";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={6} md={8}>
            <div className="error-content">
              <h1 className="error-code">404</h1>
              <h2 className="error-title">Page Not Found</h2>
              <p className="error-message">
                Oops! The page you're looking for doesn't exist or has been
                moved. Don't worry, let's get you back on track.
              </p>

              <div className="error-actions">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="me-3 mb-2"
                >
                  <FaArrowLeft className="me-2" />
                  Go Back
                </Button>
                <Button
                  as={Link}
                  to="/"
                  variant="outline-primary"
                  size="lg"
                  className="mb-2"
                >
                  <FaHome className="me-2" />
                  Home Page
                </Button>
              </div>

              <div className="quick-links mt-5">
                <h5>Popular Pages</h5>
                <div className="links-grid">
                  <Link to="/tutors">Find Tutors</Link>
                  <Link to="/classrooms">Classrooms</Link>
                  <Link to="/become-tutor">Become a Tutor</Link>
                  <Link to="/contact">Contact Us</Link>
                  <Link to="/faq">FAQ</Link>
                  <Link to="/about">About Us</Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFoundPage;
