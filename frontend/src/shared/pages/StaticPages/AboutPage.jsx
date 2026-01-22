import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaGraduationCap,
  FaUsers,
  FaLaptop,
  FaHandshake,
} from "react-icons/fa";
import "./StaticPages.css";

const AboutPage = () => {
  const stats = [
    { number: "50,000+", label: "Students" },
    { number: "10,000+", label: "Verified Tutors" },
    { number: "1M+", label: "Sessions Completed" },
    { number: "4.8", label: "Average Rating" },
  ];

  const values = [
    {
      icon: <FaGraduationCap />,
      title: "Quality Education",
      description:
        "We connect students with verified, experienced tutors who are passionate about teaching.",
    },
    {
      icon: <FaUsers />,
      title: "Personalized Learning",
      description:
        "Every student is unique. Our platform enables customized learning paths for individual needs.",
    },
    {
      icon: <FaLaptop />,
      title: "Flexible Options",
      description:
        "Learn online or offline, one-on-one or in groups – whatever works best for you.",
    },
    {
      icon: <FaHandshake />,
      title: "Trust & Safety",
      description:
        "All tutors are thoroughly verified to ensure a safe and trustworthy learning environment.",
    },
  ];

  return (
    <div className="static-page about-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>About StudySphere</h1>
              <p className="lead">
                Connecting passionate engineering tutors with curious school
                students across India. Making learning accessible, personalized,
                and impactful.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col md={3} sm={6} key={index} className="text-center mb-4">
                <div className="stat-item">
                  <h2 className="stat-number">{stat.number}</h2>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Our Story */}
      <section className="content-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2>Our Story</h2>
              <p>
                StudySphere was founded in 2023 with a simple mission: to bridge
                the gap between talented tutors and eager learners across India.
                We noticed that engineering students often possess exceptional
                knowledge but struggle to find teaching opportunities, while
                school students need affordable, quality tutoring.
              </p>
              <p>
                Our platform brings these two groups together, creating a
                win-win situation where tutors can earn while sharing their
                knowledge, and students can learn from relatable, young mentors
                who recently excelled in the same subjects.
              </p>
              <p>
                Today, StudySphere has grown into one of India's leading
                tutoring platforms, serving students from Class 1 to Class 12
                across all major subjects.
              </p>
            </Col>
            <Col lg={6}>
              <img
                src="/images/about-team.svg"
                alt="StudySphere Team"
                className="img-fluid rounded"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Values */}
      <section className="values-section">
        <Container>
          <h2 className="text-center mb-5">Our Values</h2>
          <Row>
            {values.map((value, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="value-card h-100">
                  <Card.Body className="text-center">
                    <div className="value-icon">{value.icon}</div>
                    <Card.Title>{value.title}</Card.Title>
                    <Card.Text>{value.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="content-section bg-light">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2>Our Team</h2>
              <p>
                We're a passionate team of educators, technologists, and
                dreamers committed to transforming education in India. Our
                diverse backgrounds bring unique perspectives to solving the
                challenges of modern education.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;
