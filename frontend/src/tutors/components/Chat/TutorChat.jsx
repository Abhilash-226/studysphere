import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { ChatProvider } from "../../../shared/components/Chat/contexts/ChatContext";
import ConversationList from "../../../shared/components/Chat/components/ConversationList";
import ChatHeader from "../../../shared/components/Chat/components/ChatHeader";
import MessageList from "../../../shared/components/Chat/components/MessageList";
import MessageInput from "../../../shared/components/Chat/components/MessageInput";
import useChatService from "../../../shared/components/Chat/hooks/useChatService";
import "./TutorChat.css";

/**
 * TutorChatContainer - Container for the tutor chat interface
 * Wraps the chat components with the ChatProvider
 */
const TutorChatContainer = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current tutor data on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/tutors/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch tutor profile:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Return null until user data is loaded
  if (!currentUser) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <ChatProvider userId={currentUser.id} userRole="tutor">
      <TutorChat currentUser={currentUser} />
    </ChatProvider>
  );
};

/**
 * TutorChat - Main tutor chat component
 *
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current tutor user object
 */
const TutorChat = ({ currentUser }) => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    error,
    sendMessage,
  } = useChatService();

  const [searchTerm, setSearchTerm] = useState("");
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = conversation.otherUser;
    const searchLower = searchTerm.toLowerCase();

    return (
      otherUser.name?.toLowerCase().includes(searchLower) ||
      otherUser.email?.toLowerCase().includes(searchLower)
    );
  });

  // Set active conversation based on URL parameter
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        // If conversation doesn't exist, redirect to chat home
        navigate("/tutor/chat");
      }
    }
  }, [conversationId, conversations, setActiveConversation, navigate]);

  // Handle sending messages
  const handleSendMessage = (content) => {
    if (activeConversation) {
      sendMessage(content, activeConversation.id);
    }
  };

  return (
    <Container fluid className="tutor-chat-container mt-3">
      <Row className="h-100">
        <Col md={4} className="conversation-sidebar">
          <Card className="h-100">
            <Card.Header className="tutor-chat-header">
              <h5 className="mb-0">Student Messages</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ConversationList
                conversations={filteredConversations}
                onSearch={setSearchTerm}
                searchTerm={searchTerm}
                basePath="/tutor/chat"
                activeConversationId={activeConversation?.id}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={8} className="chat-main-content">
          <Card className="h-100">
            {error && <Alert variant="danger">{error}</Alert>}

            {activeConversation ? (
              <>
                <ChatHeader
                  name={activeConversation.otherUser.name}
                  subtitle={`Student • ${activeConversation.otherUser.email}`}
                  avatarSrc={activeConversation.otherUser.profileImage}
                  onBackClick={() => navigate("/tutor/chat")}
                  showViewProfile
                  profileUrl={`/tutor/students/${activeConversation.otherUser.id}`}
                />

                <Card.Body className="chat-messages-container p-0">
                  <MessageList
                    messages={messages}
                    currentUserId={currentUser.id}
                    loading={loading}
                  />
                </Card.Body>

                <Card.Footer className="p-2">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    placeholder="Type your message to student..."
                  />
                </Card.Footer>
              </>
            ) : (
              <div className="select-conversation-placeholder d-flex flex-column align-items-center justify-content-center h-100">
                <h5>Welcome to your student messages</h5>
                <p className="text-muted">
                  Select a conversation from the list to respond to your
                  students hello
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TutorChatContainer;
