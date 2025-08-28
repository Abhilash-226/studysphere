import React, { useState } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import chatService from "../../../shared/services/chat.service";
import { useAuth } from "../../../shared/context/AuthContext";
import "./ContactTutorButton.css";

const ContactTutorButton = ({ tutorId, tutorName }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate(
        "/login-student?message=You need to login to contact a tutor&redirect=" +
          window.location.pathname
      );
      return;
    }

    // Check if user is a student
    if (currentUser.role !== "student") {
      setError("Only students can contact tutors.");
      setShowModal(true);
      return;
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage("");
    setError(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);
      setError(null);

      // Make sure we have a valid tutorId
      const validTutorId = tutorId || "default-tutor-id";
      console.log("Creating conversation with tutorId:", validTutorId);

      // Use startConversation which handles both creation and sending the first message
      const response = await chatService.startConversation(
        validTutorId,
        message
      );
      console.log("Start conversation response:", response);

      if (response.success) {
        handleCloseModal();
        navigate(`/messages/${response.conversation.id}`);
      } else {
        setError(
          response.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        className="contact-tutor-button"
        onClick={handleOpenModal}
      >
        Contact Tutor
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contact {tutorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {!error && currentUser?.role === "student" && (
            <>
              <p>
                Send a message to {tutorName} to inquire about tutoring
                sessions. Be specific about what subjects you need help with and
                your availability.
              </p>
              <Form onSubmit={handleSendMessage}>
                <Form.Group className="mb-3">
                  <Form.Label>Your Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi, I'm interested in scheduling tutoring sessions for..."
                    required
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          {!error && currentUser?.role === "student" && (
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ContactTutorButton;
