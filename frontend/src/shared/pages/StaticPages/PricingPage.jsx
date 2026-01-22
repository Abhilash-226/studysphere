import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./StaticPages.css";

const PricingPage = () => {
  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      features: [
        { text: "Browse all tutors", included: true },
        { text: "View tutor profiles", included: true },
        { text: "Send inquiries", included: true },
        { text: "Book trial sessions", included: true },
        { text: "Priority support", included: false },
        { text: "Session recordings", included: false },
      ],
      buttonText: "Get Started",
      buttonVariant: "outline-primary",
      link: "/signup-student",
    },
    {
      name: "Standard",
      price: "₹499",
      period: "/month",
      description: "Most popular for students",
      popular: true,
      features: [
        { text: "All Basic features", included: true },
        { text: "Unlimited messaging", included: true },
        { text: "Book any tutor", included: true },
        { text: "Session recordings", included: true },
        { text: "Priority support", included: true },
        { text: "Progress tracking", included: true },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "primary",
      link: "/signup-student",
    },
    {
      name: "Premium",
      price: "₹999",
      period: "/month",
      description: "For serious learners",
      features: [
        { text: "All Standard features", included: true },
        { text: "1-on-1 study advisor", included: true },
        { text: "Custom learning path", included: true },
        { text: "Priority tutor matching", included: true },
        { text: "Parent dashboard", included: true },
        { text: "Performance reports", included: true },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline-primary",
      link: "/signup-student",
    },
  ];

  const tutorBenefits = [
    "No platform fees for first 3 months",
    "Set your own hourly rates",
    "Flexible schedule management",
    "Secure payment processing",
    "Profile verification badge",
    "Marketing & promotion support",
  ];

  return (
    <div className="static-page pricing-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Simple, Transparent Pricing</h1>
              <p className="lead">
                Choose the plan that works best for you. All plans include
                access to our verified tutor network.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Pricing Cards */}
      <section className="content-section">
        <Container>
          <Row className="justify-content-center">
            {pricingPlans.map((plan, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <Card
                  className={`pricing-card h-100 ${
                    plan.popular ? "popular" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge bg="primary" className="popular-badge">
                      Most Popular
                    </Badge>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-4">
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="plan-price">
                        <span className="price">{plan.price}</span>
                        <span className="period">{plan.period}</span>
                      </div>
                      <p className="text-muted">{plan.description}</p>
                    </div>

                    <ul className="feature-list flex-grow-1">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={feature.included ? "" : "disabled"}
                        >
                          {feature.included ? (
                            <FaCheck className="text-success me-2" />
                          ) : (
                            <FaTimes className="text-muted me-2" />
                          )}
                          {feature.text}
                        </li>
                      ))}
                    </ul>

                    <Button
                      as={Link}
                      to={plan.link}
                      variant={plan.buttonVariant}
                      className="w-100 mt-3"
                    >
                      {plan.buttonText}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Tutor Section */}
      <section className="tutor-pricing-section bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2>Are you a Tutor?</h2>
              <p className="lead">
                Join StudySphere and start earning by sharing your knowledge. We
                offer competitive rates and complete flexibility.
              </p>
              <ul className="benefit-list">
                {tutorBenefits.map((benefit, index) => (
                  <li key={index}>
                    <FaCheck className="text-primary me-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button as={Link} to="/become-tutor" variant="primary" size="lg">
                Become a Tutor
              </Button>
            </Col>
            <Col lg={6}>
              <Card className="tutor-earnings-card">
                <Card.Body className="text-center p-4">
                  <h4>Average Tutor Earnings</h4>
                  <div className="earnings-display">
                    <span className="amount">₹15,000 - ₹50,000</span>
                    <span className="period">/month</span>
                  </div>
                  <p className="text-muted">
                    Based on 10-20 hours of tutoring per week
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ Link */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h3>Have questions about pricing?</h3>
              <p className="mb-3">
                Visit our FAQ or contact us for more information about our
                plans.
              </p>
              <Button
                variant="outline-primary"
                as={Link}
                to="/faq"
                className="me-2"
              >
                View FAQ
              </Button>
              <Button variant="primary" as={Link} to="/contact">
                Contact Us
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PricingPage;
