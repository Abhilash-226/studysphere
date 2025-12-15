import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getDashboardStats } from "../../../shared/services/admin.service";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      // Handle both data.stats and data.data structures
      setStats(data.stats || data.data || data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "bi-people-fill",
      color: "primary",
      link: "/admin/users",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: "bi-person-fill",
      color: "info",
      link: "/admin/users?role=student",
    },
    {
      title: "Total Tutors",
      value: stats?.totalTutors || 0,
      icon: "bi-mortarboard-fill",
      color: "success",
      link: "/admin/users?role=tutor",
    },
    {
      title: "Pending Verifications",
      value: stats?.pendingVerifications || 0,
      icon: "bi-hourglass-split",
      color: "warning",
      link: "/admin/verifications",
    },
  ];

  const verificationCards = [
    {
      title: "Approved Tutors",
      value: stats?.approvedTutors || 0,
      icon: "bi-check-circle-fill",
      color: "success",
    },
    {
      title: "Pending Tutors",
      value: stats?.pendingTutors || 0,
      icon: "bi-clock-fill",
      color: "warning",
    },
    {
      title: "Rejected Tutors",
      value: stats?.rejectedTutors || 0,
      icon: "bi-x-circle-fill",
      color: "danger",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="dashboard-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStats}>
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Dashboard Overview</h2>
          <p className="text-muted">
            Welcome back! Here's what's happening on StudySphere.
          </p>
        </div>

        {/* Main Stats */}
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <Link to={card.link} key={index} className="stat-card-link">
              <div className={`stat-card stat-card-${card.color}`}>
                <div className="stat-icon">
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{card.value}</h3>
                  <p className="stat-title">{card.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Verification Stats */}
        <div className="section-header">
          <h3>Tutor Verification Status</h3>
          <Link
            to="/admin/verifications"
            className="btn btn-outline-primary btn-sm"
          >
            View All
          </Link>
        </div>
        <div className="verification-stats-grid">
          {verificationCards.map((card, index) => (
            <div
              key={index}
              className={`verification-stat-card verification-${card.color}`}
            >
              <div className="verification-icon">
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div className="verification-content">
                <span className="verification-value">{card.value}</span>
                <span className="verification-title">{card.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="section-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions">
          <Link to="/admin/verifications" className="quick-action-card">
            <i className="bi bi-shield-check"></i>
            <span>Review Pending Verifications</span>
            {stats?.pendingVerifications > 0 && (
              <span className="badge bg-warning">
                {stats.pendingVerifications}
              </span>
            )}
          </Link>
          <Link to="/admin/users" className="quick-action-card">
            <i className="bi bi-people"></i>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/settings" className="quick-action-card">
            <i className="bi bi-gear"></i>
            <span>Platform Settings</span>
          </Link>
        </div>

        {/* Recent Activity */}
        {stats?.recentVerifications && stats.recentVerifications.length > 0 && (
          <>
            <div className="section-header">
              <h3>Recent Verification Requests</h3>
            </div>
            <div className="recent-activity">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Email</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVerifications.map((tutor) => (
                    <tr key={tutor._id}>
                      <td>
                        <div className="tutor-cell">
                          <div className="tutor-avatar">
                            {tutor.user?.name?.charAt(0)?.toUpperCase() || "T"}
                          </div>
                          <span>{tutor.user?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td>{tutor.user?.email || "N/A"}</td>
                      <td>{new Date(tutor.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`status-badge status-${tutor.verificationStatus}`}
                        >
                          {tutor.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/verifications/${tutor._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
