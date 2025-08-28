import React from "react";
import { Container } from "react-bootstrap";
import TutorChatContainer from "../../components/Chat/TutorChat";

const TutorMessagesPage = () => {
  return (
    <Container fluid className="py-4">
      <TutorChatContainer />
    </Container>
  );
};

export default TutorMessagesPage;
