import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Navbar as BootstrapNavbar,
  Container,
  Nav,
  Button,
  NavDropdown,
  Image,
} from "react-bootstrap";
import { formatImageUrl } from "../../utils/imageUtils";
import {
  FaUser,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaCog,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { currentUser, isAuthenticated, logout, getUserRole } = useAuth();

  // Check if the current route matches the link path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Determine if user is authenticated and their role
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  return (
    <BootstrapNavbar
      bg="white"
      expand="md"
      className="navbar sticky-top w-100"
      expanded={expanded}
    >
      <Container fluid className="px-md-4 px-lg-5">
        {/* Logo */}
        <BootstrapNavbar.Brand as={Link} to="/">
          <img
            src="/logo.svg"
            alt="StudySphere Logo"
            height="40"
            className="d-inline-block align-top me-2"
          />
          <span className="fw-bold text-primary">StudySphere</span>
        </BootstrapNavbar.Brand>

        {/* Toggle Button */}
        <BootstrapNavbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
          className="navbar-toggler"
        />

        {/* Menu Items */}
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Learning dropdown - visible to everyone */}
            <NavDropdown
              title="Learning"
              id="learning-dropdown"
              active={["/online-tuition", "/offline-tuition"].some(
                (path) => location.pathname === path
              )}
            >
              <NavDropdown.Item
                as={Link}
                to="/online-tuition"
                onClick={() => setExpanded(false)}
                active={isActive("/online-tuition")}
              >
                Online Tuition
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/offline-tuition"
                onClick={() => setExpanded(false)}
                active={isActive("/offline-tuition")}
              >
                In-Person Tuition
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                as={Link}
                to="/tutors"
                onClick={() => setExpanded(false)}
                active={isActive("/tutors")}
              >
                All Tutors
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              as={Link}
              to="/categories"
              className={`text-secondary ${
                isActive("/categories") ? "active" : ""
              }`}
              onClick={() => setExpanded(false)}
            >
              All Categories
            </Nav.Link>

            {/* Authenticated User Menu */}
            {authenticated ? (
              <NavDropdown
                title={
                  <span>
                    {currentUser?.profileImage ? (
                      <Image
                        src={formatImageUrl(currentUser.profileImage)}
                        alt="Profile"
                        roundedCircle
                        width={32}
                        height={32}
                        className="me-2"
                      />
                    ) : (
                      <FaUser className="me-2" />
                    )}
                    {currentUser?.firstName || "User"}
                  </span>
                }
                id="user-dropdown"
              >
                {/* Dashboard link - customized by role */}
                <NavDropdown.Item
                  as={Link}
                  to={
                    userRole === "admin"
                      ? "/admin/dashboard"
                      : userRole === "student"
                      ? "/student/dashboard"
                      : "/tutor/dashboard"
                  }
                  onClick={() => setExpanded(false)}
                >
                  <FaChalkboardTeacher className="me-2" />
                  Dashboard
                </NavDropdown.Item>

                {/* Messages link - only for students and tutors */}
                {userRole !== "admin" && (
                  <NavDropdown.Item
                    as={Link}
                    to={
                      userRole === "student" ? "/student/chat" : "/tutor/chat"
                    }
                    onClick={() => setExpanded(false)}
                  >
                    <FaEnvelope className="me-2" />
                    Messages
                  </NavDropdown.Item>
                )}

                {/* Sessions link - customized by role, not for admin */}
                {userRole !== "admin" && (
                  <NavDropdown.Item
                    as={Link}
                    to={
                      userRole === "student"
                        ? "/student/sessions"
                        : "/tutor/sessions"
                    }
                    onClick={() => setExpanded(false)}
                  >
                    <FaCalendarAlt className="me-2" />
                    {userRole === "student"
                      ? "My Sessions"
                      : "Teaching Schedule"}
                  </NavDropdown.Item>
                )}

                {/* Profile link - customized by role, not for admin */}
                {userRole !== "admin" && (
                  <NavDropdown.Item
                    as={Link}
                    to={
                      userRole === "student"
                        ? "/student/profile"
                        : "/tutor/profile"
                    }
                    onClick={() => setExpanded(false)}
                  >
                    <FaCog className="me-2" />
                    My Profile
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />

                {/* Logout option */}
                <NavDropdown.Item
                  onClick={() => {
                    setExpanded(false);
                    logout();
                  }}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                {/* Non-authenticated menu options */}
                <NavDropdown
                  title="Login"
                  id="login-dropdown"
                  active={["/login-student", "/login-tutor"].some(
                    (path) => location.pathname === path
                  )}
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/login-student"
                    onClick={() => setExpanded(false)}
                    active={isActive("/login-student")}
                  >
                    Student Login
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/login-tutor"
                    onClick={() => setExpanded(false)}
                    active={isActive("/login-tutor")}
                  >
                    Tutor Login
                  </NavDropdown.Item>
                </NavDropdown>

                <div className="ms-md-3">
                  <Button
                    as={Link}
                    to="/signup-student"
                    variant="outline-primary"
                    className="signup-btn"
                    onClick={() => setExpanded(false)}
                  >
                    Sign up
                  </Button>
                </div>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
