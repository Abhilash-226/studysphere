import React from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <Container fluid className="px-md-4 px-lg-4 pe-0">
        <Row className="align-items-center">
          <Col lg={7} md={12} className="hero-content">
            <h1 className="hero-title">
              Join Live Online or Offline Classes with the best Tutors
            </h1>
            <div className="tagline-container">
              <h2 className="tagline">
                Where Learning, Earning, and Growing Happen Together!
              </h2>
            </div>
            <div className="search-container">
              <InputGroup className="mb-0">
                <Form.Control
                  placeholder="What do you want to learn?"
                  aria-label="Search courses"
                  className="search-input"
                />
                <Button
                  variant="primary"
                  className="search-button search-button-desktop"
                >
                  Book a Demo Class <i className="fas fa-arrow-right"></i>
                </Button>
                <Button
                  variant="primary"
                  className="search-button search-button-mobile"
                >
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </div>
          </Col>
          <Col
            lg={5}
            md={12}
            className="hero-image-container d-none d-lg-block"
          >
            <div className="image-wrapper">
              <img
                src="/images/hero-student.svg"
                alt="Student attending online class"
                className="hero-image"
                width="450"
                height="auto"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
