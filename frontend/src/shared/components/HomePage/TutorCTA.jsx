import React from "react";
import { Container, Button } from "react-bootstrap";
import "./TutorCTA.css";

const TutorCTA = () => {
  return (
    <section className="tutor-cta-section">
      <Container>
        <div className="tutor-cta-container">
          <div className="tutor-cta-content">
            <h2 className="tutor-cta-title">Looking to inspire and earn?</h2>
            <p className="tutor-cta-text">
              Join StudySphere and connect with thousands of school students
              eager to learn from passionate engineering students. Build your
              teaching profile, share your knowledge, and grow your
              impact—online or offline.
            </p>
            <Button
              className="tutor-cta-button"
              variant="primary"
              href="/become-tutor"
            >
              Start Mentoring
            </Button>
          </div>
          <div className="tutor-cta-image">
            <div className="tutor-circle-container">
              <div
                className="tutor-circle tutor-circle-1"
                data-number="1"
              ></div>
              <div
                className="tutor-circle tutor-circle-2"
                data-number="2"
              ></div>
              <div
                className="tutor-circle tutor-circle-3"
                data-number="3"
              ></div>
              <div
                className="tutor-circle tutor-circle-4"
                data-number="4"
              ></div>
              <div
                className="tutor-circle tutor-circle-5"
                data-number="5"
              ></div>
              <div
                className="tutor-circle tutor-circle-6"
                data-number="6"
              ></div>
              <div
                className="tutor-circle tutor-circle-center"
                data-number=""
              ></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TutorCTA;
