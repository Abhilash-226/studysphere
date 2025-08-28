import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./HowItWorks.css";

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <Container>
        <h2 className="section-title">How StudySphere Works?</h2>

        <div className="process-container">
          <div className="process-timeline">
            <div className="timeline-line"></div>
            <div className="timeline-circle timeline-circle-1">1</div>
            <div className="timeline-circle timeline-circle-2">2</div>
            <div className="timeline-circle timeline-circle-3">3</div>
          </div>

          <Row className="process-steps">
            <Col md={4}>
              <div className="process-step">
                <div className="step-icon-container">
                  <div className="step-icon step-icon-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="32"
                      height="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                      <path d="M8 14h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M16 14h.01"></path>
                      <path d="M8 18h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M16 18h.01"></path>
                      <path d="M17 2l2 2"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="step-title">Book a Demo</h3>
                <p className="step-description">
                  Book a free demo class with a qualified tutor of your choice.
                </p>
              </div>
            </Col>

            <Col md={4}>
              <div className="process-step">
                <div className="step-icon-container">
                  <div className="step-icon step-icon-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="32"
                      height="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 8a5 5 0 0 1 1.5 3.5c0 2.89-2.3 5.5-5 7.5-2.7-2-5-4.5-5-7.5A5 5 0 1 1 12 3a4.97 4.97 0 0 1 3 1"></path>
                      <rect x="9" y="7" width="6" height="6" rx="1"></rect>
                      <path d="M12 18v-6"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="step-title">Join LIVE Demo Class</h3>
                <p className="step-description">
                  Attend the interactive demo class as scheduled and experience
                  the teaching quality.
                </p>
              </div>
            </Col>

            <Col md={4}>
              <div className="process-step">
                <div className="step-icon-container">
                  <div className="step-icon step-icon-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="32"
                      height="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="M7 15h0M2 9.5h20"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="step-title">Pay and Start</h3>
                <p className="step-description">
                  Use StudySphere SecurePay to pay and start your regular
                  classes with confidence.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        <div className="text-center">
          <Button
            variant="primary"
            className="get-started-btn"
            href="/find-tutors"
          >
            Get Started
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
