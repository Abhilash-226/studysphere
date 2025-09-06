import React, { useState } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import chatService from "../../../shared/services/chat.service";
import { useAuth } from "../../../shared/context/AuthContext";
import { findExistingConversation } from "./utils/chatUtils";

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

      // Validate that we have a proper tutorId
      if (!tutorId) {
        setError("Tutor ID is required to send a message.");
        return;
      }

      console.log("Creating conversation with tutorId:", tutorId);

      // First check if conversation already exists by creating conversation
      // The backend will return existing conversation if it exists
      const createResponse = await chatService.createConversation(tutorId);
      console.log("Create conversation response:", createResponse);

      if (createResponse.success) {
        // If conversation exists or was created, send the message
        const sendResponse = await chatService.sendMessage(
          createResponse.conversationId,
          message
        );

        if (sendResponse.success) {
          handleCloseModal();
          // Navigate to the correct chat route based on user role
          const chatPath =
            currentUser.role === "student" ? "/student/chat" : "/tutor/chat";
          navigate(`${chatPath}/${createResponse.conversationId}`);
        } else {
          setError(
            sendResponse.message || "Failed to send message. Please try again."
          );
        }
      } else {
        setError(
          createResponse.message ||
            "Failed to create conversation. Please try again."
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
