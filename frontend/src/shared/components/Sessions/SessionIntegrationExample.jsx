import React, { useState } from "react";
import { Button } from "react-bootstrap";
import SessionBookingModal from "../shared/components/Sessions/BookingModal/SessionBookingModal";
import SessionDashboard from "../shared/components/Sessions/Dashboard/SessionDashboard";

/**
 * SessionIntegrationExample - Example of how to integrate session management
 * This shows how to use the session booking modal and dashboard in any component
 */
const SessionIntegrationExample = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  // Example tutor data - this would come from your tutor selection
  const exampleTutor = {
    id: "tutor123",
    name: "Dr. John Smith",
    profileImage: "/images/tutors/john-smith.jpg",
    subjects: ["Mathematics", "Physics"],
    hourlyRate: 50,
    bio: "Experienced math and physics tutor with 10+ years of teaching experience.",
    rating: 4.8,
    totalReviews: 124,
  };

  const handleBookSession = (tutor) => {
    setSelectedTutor(tutor);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (sessionData) => {
    console.log("Session booked successfully:", sessionData);
    setShowBookingModal(false);
    // Refresh dashboard or show success message
  };

  const handleBookingError = (error) => {
    console.error("Booking failed:", error);
    // Show error message to user
  };

  return (
    <div className="session-integration-example">
      <h2>Session Management Integration Example</h2>

      {/* Example: Book session button - this could be in tutor cards, profiles, etc. */}
      <div className="mb-4">
        <h4>Book a Session</h4>
        <p>
          This button would typically be in a tutor card or tutor profile page:
        </p>
        <Button
          variant="primary"
          onClick={() => handleBookSession(exampleTutor)}
        >
          Book Session with Dr. John Smith
        </Button>
      </div>

      {/* Session Dashboard - shows all user's sessions */}
      <div className="mb-4">
        <h4>Session Dashboard</h4>
        <p>This dashboard shows all sessions for the current user:</p>
        <SessionDashboard />
      </div>

      {/* Session Booking Modal */}
      <SessionBookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tutor={selectedTutor}
        onSuccess={handleBookingSuccess}
        onError={handleBookingError}
      />
    </div>
  );
};

export default SessionIntegrationExample;
