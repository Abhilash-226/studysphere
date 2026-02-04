import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login-student");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: "bi-speedometer2",
      label: "Dashboard",
    },
    {
      path: "/admin/verifications",
      icon: "bi-shield-check",
      label: "Tutor Verifications",
    },
    {
      path: "/admin/users",
      icon: "bi-people",
      label: "Users",
    },
    {
      path: "/admin/settings",
      icon: "bi-gear",
      label: "Settings",
    },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${mobileSidebarOpen ? "show" : ""}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${!sidebarExpanded ? "collapsed" : ""} ${mobileSidebarOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            {(sidebarExpanded || mobileSidebarOpen) && (
              <span className="brand-text">StudySphere</span>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <i
              className={`bi ${
                sidebarExpanded ? "bi-chevron-left" : "bi-chevron-right"
              }`}
            ></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {(sidebarExpanded || mobileSidebarOpen) && (
              <span className="nav-section-title">Main Menu</span>
            )}
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <i className={`bi ${item.icon}`}></i>
                    {(sidebarExpanded || mobileSidebarOpen) && (
                      <span>{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          {(sidebarExpanded || mobileSidebarOpen) && (
            <div className="admin-info">
              <div className="admin-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="admin-details">
                <span className="admin-name">{user?.name || "Admin"}</span>
                <span className="admin-role">Administrator</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            {(sidebarExpanded || mobileSidebarOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <i className="bi bi-list"></i>
            </button>
            <h1 className="page-title">Admin Panel</h1>
          </div>
          <div className="header-right">
            <div className="header-user">
              <i className="bi bi-person"></i>
              <span>{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
