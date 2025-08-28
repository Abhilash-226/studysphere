import React from "react";
import SignupForm from "../../shared/components/Auth/SignupForm";

const StudentSignup = () => {
  return (
    <div className="student-auth-page">
      <SignupForm userType="student" />
    </div>
  );
};

export default StudentSignup;
