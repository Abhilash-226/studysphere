import React from "react";
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./CategoriesSection.css";

const CategoriesSection = () => {
  return (
    <section className="categories-section">
      <Container>
        <h2 className="section-title">Find a Tutor for Anything!</h2>

        {/* Main Category Tabs - Only Online and Offline */}
        <Tab.Container id="categories-tabs" defaultActiveKey="online-classes">
          <Nav variant="tabs" className="category-tabs">
            <Nav.Item>
              <Nav.Link eventKey="online-classes">Online Classes</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="offline-tuition">Offline Tuition</Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="categories-content">
            <Tab.Content>
              <Tab.Pane eventKey="online-classes">
                <div className="categories-grid">
                  <Row>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Primary Classes</h3>
                        <ul className="category-list">
                          <li>
                            <Link to="/tutors/online/class-1">
                              Class 1 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-2">
                              Class 2 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-3">
                              Class 3 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-4">
                              Class 4 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-5">
                              Class 5 Tuition
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Middle & High School</h3>
                        <ul className="category-list">
                          <li>
                            <Link to="/tutors/online/class-6">
                              Class 6 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-7">
                              Class 7 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/class-8">
                              Class 8 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tutors/online/class-9"
                              className="popular"
                            >
                              Class 9 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tutors/online/class-10"
                              className="popular"
                            >
                              Class 10 Tuition
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Learning Format</h3>
                        <ul className="category-list">
                          <li>
                            <Link
                              to="/tutors/online/one-on-one"
                              className="popular"
                            >
                              One-on-One Tutoring
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/group">
                              Group Tutoring
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/self-paced">
                              Self-Paced Learning
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/live">
                              Live Interactive Classes
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/online/recorded">
                              Recorded Lessons
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="offline-tuition">
                <div className="categories-grid">
                  <Row>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Primary Classes</h3>
                        <ul className="category-list">
                          <li>
                            <Link to="/tutors/offline/class-1">
                              Class 1 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-2">
                              Class 2 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-3">
                              Class 3 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-4">
                              Class 4 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-5">
                              Class 5 Tuition
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Middle & High School</h3>
                        <ul className="category-list">
                          <li>
                            <Link to="/tutors/offline/class-6">
                              Class 6 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-7">
                              Class 7 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/class-8">
                              Class 8 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tutors/offline/class-9"
                              className="popular"
                            >
                              Class 9 Tuition
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/tutors/offline/class-10"
                              className="popular"
                            >
                              Class 10 Tuition
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="category-column">
                        <h3>Learning Format</h3>
                        <ul className="category-list">
                          <li>
                            <Link to="/tutors/offline/home" className="popular">
                              Home Tutoring
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/center">
                              Tutoring Centers
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/group">
                              Group Classes
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/weekend">
                              Weekend Batches
                            </Link>
                          </li>
                          <li>
                            <Link to="/tutors/offline/individual">
                              Individual Attention
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </Container>
    </section>
  );
};

export default CategoriesSection;
