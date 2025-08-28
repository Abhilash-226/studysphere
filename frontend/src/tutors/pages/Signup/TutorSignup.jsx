import React from "react";
import SignupForm from "../../../shared/components/Auth/SignupForm";
import "./TutorSignup.css";

/**
 * TutorSignup - Component for tutor signup page
 * @returns {React.ReactElement} - Rendered component
 */
const TutorSignup = () => {
  return (
    <div className="tutor-auth-page">
      <SignupForm userType="tutor" />
    </div>
  );
};

export default TutorSignup;
