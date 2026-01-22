import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Accordion,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./StaticPages.css";

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      category: "General",
      questions: [
        {
          q: "What is StudySphere?",
          a: "StudySphere is an online platform that connects students with verified tutors for personalized learning. We offer both online and offline tutoring options across all subjects and class levels.",
        },
        {
          q: "How does StudySphere work?",
          a: "Students can browse tutor profiles, read reviews, and book sessions directly through our platform. After booking, students can attend online sessions via our virtual classroom or meet tutors in person for offline sessions.",
        },
        {
          q: "Is StudySphere free to use?",
          a: "Creating an account and browsing tutors is completely free. Students only pay for the sessions they book. Tutors set their own rates, and we charge a small platform fee on each transaction.",
        },
        {
          q: "Which subjects are available?",
          a: "We offer tutoring in all major subjects including Mathematics, Science (Physics, Chemistry, Biology), Languages (English, Hindi, etc.), Social Studies, Computer Science, and more. Visit our Subjects page for the full list.",
        },
      ],
    },
    {
      category: "For Students",
      questions: [
        {
          q: "How do I find a tutor?",
          a: "Use our search and filter features to find tutors by subject, class level, price range, teaching mode (online/offline), rating, and availability. You can read reviews from other students to make an informed decision.",
        },
        {
          q: "Can I take a trial session?",
          a: "Yes! Many tutors offer trial sessions at discounted rates or even free. Look for the 'Trial Available' badge on tutor profiles.",
        },
        {
          q: "How do I book a session?",
          a: "Click on a tutor's profile, select your preferred date and time from their available slots, and complete the payment. You'll receive a confirmation email with session details.",
        },
        {
          q: "What if I need to cancel a session?",
          a: "You can cancel sessions through your dashboard. Cancellations 24+ hours before get a full refund. Cancellations 12-24 hours before get a 50% refund. Less than 12 hours notice receives no refund.",
        },
        {
          q: "Are the sessions recorded?",
          a: "Online sessions can be recorded with mutual consent. Recordings are available for 30 days after the session for review purposes.",
        },
        {
          q: "How do online sessions work?",
          a: "Online sessions take place in our virtual classroom with video conferencing, screen sharing, and an interactive whiteboard. You just need a computer with a webcam and stable internet connection.",
        },
      ],
    },
    {
      category: "For Tutors",
      questions: [
        {
          q: "How do I become a tutor on StudySphere?",
          a: "Click 'Become a Tutor' and fill out your profile with qualifications, experience, and subjects you teach. After verification (usually 2-3 days), your profile will be live.",
        },
        {
          q: "What are the verification requirements?",
          a: "You need to provide ID proof, education certificates, and optionally any teaching certifications. We may conduct a brief video interview to verify your teaching abilities.",
        },
        {
          q: "How much can I earn?",
          a: "You set your own rates! Most tutors on our platform charge ₹200-800 per hour depending on subject complexity and experience. Active tutors earn ₹15,000-50,000+ per month.",
        },
        {
          q: "When do I get paid?",
          a: "Payments are released 24 hours after session completion. You can withdraw earnings to your bank account anytime (minimum ₹500). Withdrawals typically process within 2-3 business days.",
        },
        {
          q: "What if a student doesn't show up?",
          a: "If a student doesn't join within 15 minutes of the scheduled time without prior notice, you can mark the session as a no-show. The student will be charged, and you'll receive your payment.",
        },
        {
          q: "Can I teach multiple subjects?",
          a: "Yes! You can add multiple subjects to your profile. Make sure you have the qualifications and experience for each subject you list.",
        },
      ],
    },
    {
      category: "Payments & Security",
      questions: [
        {
          q: "Is my payment information secure?",
          a: "Absolutely. We use industry-standard encryption and partner with trusted payment processors. We never store your complete card details on our servers.",
        },
        {
          q: "What payment methods are accepted?",
          a: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets like Paytm and PhonePe.",
        },
        {
          q: "How does the refund process work?",
          a: "Refunds are processed to your original payment method within 5-7 business days after approval. For urgent issues, contact our support team.",
        },
        {
          q: "Is there a money-back guarantee?",
          a: "Yes! If you're unsatisfied with your first session with a new tutor, contact us within 24 hours for a full refund or credit.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What are the technical requirements for online sessions?",
          a: "A computer or tablet with a webcam, microphone, stable internet connection (minimum 2 Mbps), and a modern web browser (Chrome, Firefox, or Safari recommended).",
        },
        {
          q: "The video is not working. What should I do?",
          a: "Check your browser permissions for camera and microphone access. Try refreshing the page or switching browsers. Ensure no other app is using your camera.",
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox.",
        },
        {
          q: "How do I contact support?",
          a: "You can reach us via email at support@studysphere.com, call +91 800-555-0000, or use the live chat on our website. We're available Mon-Sat, 9 AM - 8 PM IST.",
        },
      ],
    },
  ];

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="static-page faq-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Frequently Asked Questions</h1>
              <p className="lead">
                Find answers to common questions about StudySphere.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ Content */}
      <section className="content-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((category, catIndex) => (
                  <div key={catIndex} className="faq-category mb-5">
                    <h3 className="category-title">{category.category}</h3>
                    <Accordion>
                      {category.questions.map((faq, faqIndex) => (
                        <Accordion.Item
                          eventKey={`${catIndex}-${faqIndex}`}
                          key={faqIndex}
                        >
                          <Accordion.Header>{faq.q}</Accordion.Header>
                          <Accordion.Body>{faq.a}</Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <h4>No results found</h4>
                  <p className="text-muted">
                    Try a different search term or browse all categories above.
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Still Need Help */}
      <section className="cta-section bg-light">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h3>Still have questions?</h3>
              <p className="mb-4">
                Can't find what you're looking for? Our support team is here to
                help.
              </p>
              <Button as={Link} to="/contact" variant="primary" size="lg">
                Contact Support
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default FAQPage;
