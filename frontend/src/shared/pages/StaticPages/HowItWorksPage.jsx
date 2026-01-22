import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUserCheck,
  FaCalendarAlt,
  FaVideo,
  FaStar,
  FaGraduationCap,
} from "react-icons/fa";
import "./StaticPages.css";

const HowItWorksPage = () => {
  const studentSteps = [
    {
      icon: <FaSearch />,
      title: "Find Your Tutor",
      description:
        "Browse our verified tutors by subject, class level, price, or teaching style. Read reviews and compare profiles.",
    },
    {
      icon: <FaUserCheck />,
      title: "Book a Session",
      description:
        "Choose a time that works for you and book a trial or regular session. Secure payment through our platform.",
    },
    {
      icon: <FaVideo />,
      title: "Start Learning",
      description:
        "Join your online class or meet in person. Learn at your own pace with personalized attention.",
    },
    {
      icon: <FaStar />,
      title: "Track Progress",
      description:
        "Monitor your learning journey, review session recordings, and provide feedback to help others.",
    },
  ];

  const tutorSteps = [
    {
      icon: <FaGraduationCap />,
      title: "Create Your Profile",
      description:
        "Sign up and create a compelling profile showcasing your qualifications, experience, and teaching style.",
    },
    {
      icon: <FaUserCheck />,
      title: "Get Verified",
      description:
        "Complete our verification process to earn a trust badge and appear higher in search results.",
    },
    {
      icon: <FaCalendarAlt />,
      title: "Set Your Schedule",
      description:
        "Define your availability and pricing. Accept or decline session requests based on your preferences.",
    },
    {
      icon: <FaStar />,
      title: "Start Earning",
      description:
        "Teach students, build your reputation through reviews, and earn money doing what you love.",
    },
  ];

  return (
    <div className="static-page how-it-works-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>How StudySphere Works</h1>
              <p className="lead">
                Getting started is easy. Whether you're a student looking to
                learn or a tutor ready to teach, we've made the process simple.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* For Students */}
      <section className="content-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2>For Students</h2>
              <p className="text-muted">
                Find the perfect tutor and start your learning journey in
                minutes.
              </p>
            </Col>
          </Row>

          <Row>
            {studentSteps.map((step, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <Card className="step-card h-100 text-center">
                  <Card.Body>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-icon">{step.icon}</div>
                    <Card.Title>{step.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {step.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="justify-content-center mt-4">
            <Col xs="auto">
              <Button as={Link} to="/tutors" variant="primary" size="lg">
                Find a Tutor
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* For Tutors */}
      <section className="content-section bg-light">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2>For Tutors</h2>
              <p className="text-muted">
                Share your knowledge and earn money on your own terms.
              </p>
            </Col>
          </Row>

          <Row>
            {tutorSteps.map((step, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <Card className="step-card h-100 text-center">
                  <Card.Body>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-icon">{step.icon}</div>
                    <Card.Title>{step.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {step.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="justify-content-center mt-4">
            <Col xs="auto">
              <Button as={Link} to="/become-tutor" variant="primary" size="lg">
                Become a Tutor
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2>Why Choose StudySphere?</h2>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-4">
              <div className="feature-item text-center">
                <h4>Verified Tutors</h4>
                <p className="text-muted">
                  All tutors go through our verification process to ensure
                  quality and safety.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-item text-center">
                <h4>Flexible Learning</h4>
                <p className="text-muted">
                  Choose between online classes, in-person tutoring, or a mix of
                  both.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-item text-center">
                <h4>Secure Payments</h4>
                <p className="text-muted">
                  Safe and secure payment processing. Money-back guarantee for
                  unsatisfactory sessions.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-primary text-white">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h3>Ready to Get Started?</h3>
              <p className="mb-4">
                Join thousands of students and tutors already on StudySphere.
              </p>
              <Button
                as={Link}
                to="/signup-student"
                variant="light"
                size="lg"
                className="me-3"
              >
                Sign Up as Student
              </Button>
              <Button
                as={Link}
                to="/become-tutor"
                variant="outline-light"
                size="lg"
              >
                Become a Tutor
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HowItWorksPage;
