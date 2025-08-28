import React from "react";
import LoginForm from "../../shared/components/Auth/LoginForm";

const StudentLogin = () => {
  return (
    <div className="student-auth-page">
      <LoginForm userType="student" />
    </div>
  );
};

export default StudentLogin;
