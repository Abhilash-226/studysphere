import React from "react";
import LoginForm from "../../../shared/components/Auth/LoginForm";
import "./TutorLogin.css";

/**
 * TutorLogin - Component for tutor login page
 * @returns {React.ReactElement} - Rendered component
 */
const TutorLogin = () => {
  return (
    <div className="tutor-auth-page">
      <LoginForm userType="tutor" />
    </div>
  );
};

export default TutorLogin;
