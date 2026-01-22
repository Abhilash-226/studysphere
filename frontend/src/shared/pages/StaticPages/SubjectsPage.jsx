import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCalculator,
  FaFlask,
  FaAtom,
  FaDna,
  FaLaptopCode,
  FaBook,
  FaGlobeAsia,
  FaChartLine,
  FaLanguage,
  FaPalette,
  FaMusic,
  FaRunning,
} from "react-icons/fa";
import "./StaticPages.css";

const SubjectsPage = () => {
  const subjects = [
    {
      icon: <FaCalculator />,
      name: "Mathematics",
      description: "Arithmetic, Algebra, Geometry, Calculus, Statistics",
      tutorCount: 2500,
      color: "#4a7aff",
    },
    {
      icon: <FaAtom />,
      name: "Physics",
      description: "Mechanics, Thermodynamics, Optics, Modern Physics",
      tutorCount: 1800,
      color: "#00c9a7",
    },
    {
      icon: <FaFlask />,
      name: "Chemistry",
      description: "Organic, Inorganic, Physical Chemistry",
      tutorCount: 1600,
      color: "#ff6b6b",
    },
    {
      icon: <FaDna />,
      name: "Biology",
      description: "Botany, Zoology, Human Biology, Ecology",
      tutorCount: 1400,
      color: "#6bcb77",
    },
    {
      icon: <FaLaptopCode />,
      name: "Computer Science",
      description: "Programming, Web Development, Data Structures",
      tutorCount: 1200,
      color: "#845ec2",
    },
    {
      icon: <FaBook />,
      name: "English",
      description: "Grammar, Literature, Writing, Speaking",
      tutorCount: 2000,
      color: "#ffc75f",
    },
    {
      icon: <FaGlobeAsia />,
      name: "Social Studies",
      description: "History, Geography, Civics, Economics",
      tutorCount: 1100,
      color: "#ff8066",
    },
    {
      icon: <FaChartLine />,
      name: "Economics",
      description: "Microeconomics, Macroeconomics, Business Studies",
      tutorCount: 800,
      color: "#00c2a8",
    },
    {
      icon: <FaLanguage />,
      name: "Languages",
      description: "Hindi, Sanskrit, French, German, Spanish",
      tutorCount: 900,
      color: "#d65db1",
    },
    {
      icon: <FaPalette />,
      name: "Arts",
      description: "Drawing, Painting, Design, Art History",
      tutorCount: 500,
      color: "#ff9671",
    },
    {
      icon: <FaMusic />,
      name: "Music",
      description: "Vocal, Instrumental, Music Theory",
      tutorCount: 400,
      color: "#c34a36",
    },
    {
      icon: <FaRunning />,
      name: "Physical Education",
      description: "Fitness, Sports Training, Health Education",
      tutorCount: 300,
      color: "#008e9b",
    },
  ];

  const classLevels = [
    {
      level: "Primary (1-5)",
      description: "Foundation building with fun learning",
    },
    {
      level: "Middle (6-8)",
      description: "Concept strengthening and skill development",
    },
    {
      level: "High School (9-10)",
      description: "Board exam preparation and deep understanding",
    },
    {
      level: "Senior Secondary (11-12)",
      description: "Competitive exam prep and specialization",
    },
  ];

  return (
    <div className="static-page subjects-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Subjects We Offer</h1>
              <p className="lead">
                From Mathematics to Music, find expert tutors for every subject.
                We cover all major boards including CBSE, ICSE, and State
                Boards.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Subjects Grid */}
      <section className="content-section">
        <Container>
          <Row>
            {subjects.map((subject, index) => (
              <Col lg={3} md={4} sm={6} key={index} className="mb-4">
                <Card className="subject-card h-100">
                  <Card.Body className="text-center">
                    <div
                      className="subject-icon"
                      style={{ color: subject.color }}
                    >
                      {subject.icon}
                    </div>
                    <Card.Title>{subject.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {subject.description}
                    </Card.Text>
                    <div className="tutor-count">
                      <span className="count">{subject.tutorCount}+</span>{" "}
                      tutors
                    </div>
                    <Button
                      as={Link}
                      to={`/tutors?subject=${encodeURIComponent(subject.name)}`}
                      variant="outline-primary"
                      size="sm"
                      className="mt-2"
                    >
                      Find Tutors
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Class Levels */}
      <section className="content-section bg-light">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2>All Class Levels</h2>
              <p className="text-muted">
                We have tutors specialized for every class level from 1st to
                12th.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            {classLevels.map((level, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <Card className="level-card text-center h-100">
                  <Card.Body>
                    <Card.Title>{level.level}</Card.Title>
                    <Card.Text className="text-muted">
                      {level.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Boards Section */}
      <section className="content-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2>Supported Educational Boards</h2>
              <p className="text-muted">
                Our tutors are experienced with all major educational boards in
                India.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="boards-list d-flex flex-wrap justify-content-center">
                {["CBSE", "ICSE", "State Boards", "IB", "IGCSE", "NIOS"].map(
                  (board, index) => (
                    <span key={index} className="board-badge">
                      {board}
                    </span>
                  ),
                )}
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
              <h3>Can't find your subject?</h3>
              <p className="mb-4">
                We're constantly adding new subjects and tutors. Contact us if
                you need help finding a specific subject.
              </p>
              <Button
                as={Link}
                to="/contact"
                variant="light"
                size="lg"
                className="me-3"
              >
                Contact Us
              </Button>
              <Button as={Link} to="/tutors" variant="outline-light" size="lg">
                Browse All Tutors
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default SubjectsPage;
