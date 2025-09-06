import React from "react";
import { EmailVerificationBanner } from "../EmailVerification";

/**
 * AppLayout - Main layout component that includes the email verification banner
 */
const AppLayout = ({ children, showVerificationBanner = true }) => {
  return (
    <>
      {showVerificationBanner && <EmailVerificationBanner />}
      {children}
    </>
  );
};

export default AppLayout;
