import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { ChatProvider } from "../contexts/ChatContext";
import ConversationList from "../components/ConversationList";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import useChatService from "../hooks/useChatService";
import "../common/ChatComponents.css";

/**
 * ChatPageContainer - Main container for the chat interface
 * Wraps the chat components with the ChatProvider and authentication
 */
const ChatPageContainer = () => {
  const { currentUser, isAuthenticated, getUserRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get user data
    if (isAuthenticated()) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Please log in to access your messages.</Alert>
      </Container>
    );
  }

  const userRole = getUserRole();
  const basePath = userRole === "student" ? "/student/chat" : "/tutor/chat";

  return (
    <ChatProvider userId={currentUser?.id} userRole={userRole}>
      <ChatPage currentUser={currentUser} basePath={basePath} />
    </ChatProvider>
  );
};

/**
 * ChatPage - Main chat component with conversation list and message view
 *
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object
 * @param {string} props.basePath - Base path for chat routes
 */
const ChatPage = ({ currentUser, basePath }) => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    loading,
    error,
  } = useChatService();

  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMessages, setShowMessages] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent page scrolling when chat page loads
  useEffect(() => {
    // Reset page scroll to a reasonable position (not at bottom)
    const currentScrollY = window.scrollY;
    if (currentScrollY > 100) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []); // Run only on mount

  // Set active conversation based on URL parameter
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c._id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
        setShowMessages(true);
      } else {
        // If conversation doesn't exist, redirect to chat home
        navigate(basePath);
      }
    }
  }, [
    conversationId,
    conversations,
    setActiveConversation,
    navigate,
    basePath,
  ]);

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    setShowMessages(true);
    navigate(`${basePath}/${conversation._id}`);
  };

  // Handle back button on mobile
  const handleBack = () => {
    setShowMessages(false);
    setActiveConversation(null);
    navigate(basePath);
  };

  // Prevent page from scrolling to footer on initial load
  useEffect(() => {
    // Only scroll to top on initial page load, don't interfere with chat scrolling
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container
      fluid
      className={`chat-container ${isMobile ? "chat-mobile" : ""}`}
    >
      <Row className="h-100 g-0">
        {/* Conversation List Sidebar - Hidden on mobile when viewing messages */}
        <Col
          md={4}
          lg={3}
          className={`conversation-sidebar ${
            isMobile && showMessages ? "d-none" : ""
          }`}
        >
          <Card className="h-100 border-0 rounded-0">
            <Card.Header className="chat-list-header">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Messages
              </h5>
              {conversations.length > 0 && (
                <span className="conversation-count">
                  {conversations.length}
                </span>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <ConversationList
                onConversationSelect={handleConversationSelect}
                selectedConversationId={activeConversation?._id}
                showHeader={false}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Main Chat Area - Full width on mobile when viewing messages */}
        <Col
          md={8}
          lg={9}
          className={`chat-main-content ${
            isMobile && !showMessages ? "d-none" : ""
          }`}
        >
          <Card className="h-100 border-0 rounded-0">
            {error && (
              <Alert variant="danger" className="m-3 mb-0">
                {error}
              </Alert>
            )}

            {activeConversation ? (
              <>
                {/* Chat Header */}
                <ChatHeader
                  conversation={activeConversation}
                  onBack={handleBack}
                  showBackButton={isMobile}
                />

                {/* Messages */}
                <Card.Body
                  className="chat-messages-area p-0"
                  style={{ overflowY: "auto", flex: 1 }}
                >
                  <MessageList
                    conversationId={activeConversation._id}
                    currentUserId={currentUser?.id}
                  />
                </Card.Body>

                {/* Message Input */}
                <Card.Footer className="chat-input-footer p-2">
                  <MessageInput
                    conversationId={activeConversation._id}
                    disabled={loading}
                    placeholder={`Message ${
                      activeConversation.otherUser?.name || "user"
                    }...`}
                  />
                </Card.Footer>
              </>
            ) : (
              /* Welcome Screen - Only shown on desktop or when no conversation selected */
              <div className="select-conversation-placeholder d-flex flex-column align-items-center justify-content-center h-100">
                <div className="text-center p-4">
                  <div className="empty-chat-icon mb-3">
                    <i
                      className="bi bi-chat-square-text"
                      style={{ fontSize: "3rem", color: "#6c757d" }}
                    ></i>
                  </div>
                  <h5 className="mb-2">Your Messages</h5>
                  <p className="text-muted mb-0">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPageContainer;
