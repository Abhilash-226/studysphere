import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand">
            <i className="bi bi-mortarboard-fill brand-icon"></i>
            {sidebarOpen && <span className="brand-text">StudySphere</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i
              className={`bi ${
                sidebarOpen ? "bi-chevron-left" : "bi-chevron-right"
              }`}
            ></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {sidebarOpen && (
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
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
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
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">Admin Panel</h1>
          </div>
          <div className="header-right">
            <button className="header-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="header-user">
              <span>{user?.name || "Admin"}</span>
              <i className="bi bi-person-circle"></i>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
