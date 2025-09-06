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
    navigate(`${basePath}/${conversation._id}`);
  };

  // Prevent page from scrolling to footer on initial load
  useEffect(() => {
    // Only scroll to top on initial page load, don't interfere with chat scrolling
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container fluid className="chat-container">
      <Row className="h-100">
        {/* Conversation List Sidebar */}
        <Col md={4} lg={3} className="conversation-sidebar">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Messages</h5>
              {conversations.length > 0 && (
                <small className="text-muted">
                  {conversations.length} conversation
                  {conversations.length !== 1 ? "s" : ""}
                </small>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <ConversationList
                onConversationSelect={handleConversationSelect}
                selectedConversationId={activeConversation?._id}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Main Chat Area */}
        <Col md={8} lg={9} className="chat-main-content">
          <Card className="h-100">
            {error && (
              <Alert variant="danger" className="m-3">
                {error}
              </Alert>
            )}

            {activeConversation ? (
              <>
                {/* Chat Header */}
                <ChatHeader
                  conversation={activeConversation}
                  onBack={() => navigate(basePath)}
                  showBackButton={window.innerWidth <= 768} // Show on mobile
                />

                {/* Messages */}
                <Card.Body
                  className="p-0"
                  style={{ overflowY: "auto", flex: 1 }}
                >
                  <MessageList
                    conversationId={activeConversation._id}
                    currentUserId={currentUser?.id}
                  />
                </Card.Body>

                {/* Message Input */}
                <Card.Footer className="p-2">
                  <MessageInput
                    conversationId={activeConversation._id}
                    disabled={loading}
                    placeholder={`Send a message to ${activeConversation.otherUser.name}...`}
                  />
                </Card.Footer>
              </>
            ) : (
              /* Welcome Screen */
              <div className="select-conversation-placeholder d-flex flex-column align-items-center justify-content-center h-100">
                <div className="text-center">
                  <h4 className="mb-3">Welcome to your messages</h4>
                  <p className="text-muted mb-4">
                    Select a conversation from the list to start chatting, or
                    contact a{" "}
                    {currentUser?.role === "student" ? "tutor" : "student"} to
                    begin a new conversation.
                  </p>
                  {conversations.length === 0 && (
                    <div className="empty-state">
                      <p className="text-muted">
                        <small>
                          No conversations yet. Start by browsing{" "}
                          {currentUser?.role === "student"
                            ? "tutors"
                            : "students"}{" "}
                          and sending a message.
                        </small>
                      </p>
                    </div>
                  )}
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
