import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  FaChalkboardTeacher,
  FaClock,
  FaMoneyBillWave,
  FaCertificate,
  FaArrowRight,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import "./BecomeTutor.css";

/**
 * BecomeTutor - Landing page component for potential tutors
 * @returns {React.ReactElement} - Rendered component
 */
const BecomeTutor = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup-tutor");
  };

  return (
    <div className="become-tutor-page">
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <Container>
          <h1 className="display-4 mb-3">
            Share Your Knowledge, Inspire Students
          </h1>
          <p className="lead mb-4">
            Join our community of expert tutors and make a difference in
            students' lives while earning on your own schedule.
          </p>
          <Button size="lg" className="primary-btn" onClick={handleGetStarted}>
            Start Mentoring Today <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">
            Why Become a Tutor with StudySphere?
          </h2>
          <Row className="g-4">
            <Col md={3}>
              <Card className="h-100 benefit-card">
                <Card.Body className="text-center">
                  <div className="icon-wrapper mb-3">
                    <FaChalkboardTeacher size={40} />
                  </div>
                  <Card.Title>Flexible Teaching</Card.Title>
                  <Card.Text>
                    Choose when and how you teach - online, in-person, or both.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 benefit-card">
                <Card.Body className="text-center">
                  <div className="icon-wrapper mb-3">
                    <FaClock size={40} />
                  </div>
                  <Card.Title>Set Your Schedule</Card.Title>
                  <Card.Text>
                    Work as much or as little as you want, on your own terms.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 benefit-card">
                <Card.Body className="text-center">
                  <div className="icon-wrapper mb-3">
                    <FaMoneyBillWave size={40} />
                  </div>
                  <Card.Title>Competitive Earnings</Card.Title>
                  <Card.Text>
                    Set your own hourly rate and receive payments securely.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 benefit-card">
                <Card.Body className="text-center">
                  <div className="icon-wrapper mb-3">
                    <FaCertificate size={40} />
                  </div>
                  <Card.Title>Build Credibility</Card.Title>
                  <Card.Text>
                    Enhance your teaching profile with ratings and reviews.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-5">
        <Container>
          <h2 className="text-center mb-5">How to Become a Tutor</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="step-card text-center">
                <div className="step-number">1</div>
                <h3>Sign Up</h3>
                <p>
                  Create your tutor account with basic information and upload
                  your credentials for verification.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-card text-center">
                <div className="step-number">2</div>
                <h3>Complete Your Profile</h3>
                <p>
                  Add your bio, teaching preferences, qualifications, and set
                  your availability schedule.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-card text-center">
                <div className="step-number">3</div>
                <h3>Start Teaching</h3>
                <p>
                  Once verified, your profile goes live and students can book
                  sessions with you.
                </p>
              </div>
            </Col>
          </Row>
          <div className="text-center mt-5">
            <Button
              size="lg"
              className="primary-btn"
              onClick={handleGetStarted}
            >
              Begin Your Teaching Journey <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          <Row className="g-4">
            <Col md={6}>
              <div className="faq-item">
                <h4>What qualifications do I need?</h4>
                <p>
                  You should have a degree or certification in your teaching
                  subject. Experience in teaching or mentoring is a plus but not
                  mandatory.
                </p>
              </div>
              <div className="faq-item">
                <h4>How long does verification take?</h4>
                <p>
                  Our verification process typically takes 1-2 business days
                  once you've submitted all required documents.
                </p>
              </div>
              <div className="faq-item">
                <h4>How do I get paid?</h4>
                <p>
                  Payments are processed securely through our platform. You can
                  withdraw your earnings to your bank account weekly.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="faq-item">
                <h4>Can I teach multiple subjects?</h4>
                <p>
                  Yes, you can offer tutoring in multiple subjects based on your
                  expertise and qualifications.
                </p>
              </div>
              <div className="faq-item">
                <h4>What technology do I need for online tutoring?</h4>
                <p>
                  A computer with a reliable internet connection, webcam, and
                  microphone. Our platform provides all the necessary tools for
                  virtual classroom interaction.
                </p>
              </div>
              <div className="faq-item">
                <h4>How much can I earn?</h4>
                <p>
                  Earnings vary based on your subject, experience, and hours you
                  dedicate. Most tutors earn between ₹500-₹2000 per hour.
                </p>
              </div>
            </Col>
          </Row>
          <div className="text-center mt-4">
            <p>
              Have more questions? <Link to="/contact">Contact us</Link>
            </p>
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section py-5 text-center">
        <Container>
          <h2 className="mb-4">Ready to Transform Lives Through Education?</h2>
          <p className="lead mb-4">
            Join our growing community of tutors today and start making a
            difference.
          </p>
          <Button size="lg" className="primary-btn" onClick={handleGetStarted}>
            Start Mentoring Now <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default BecomeTutor;
