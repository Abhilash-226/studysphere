import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getPendingVerifications } from "../../../shared/services/admin.service";
import "./VerificationQueue.css";

const VerificationQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    fetchVerifications();
  }, [pagination.page, filters]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await getPendingVerifications({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        search: filters.search,
      });
      // Handle both data.tutors and data.data.tutors structures
      const tutors = data.tutors || data.data?.tutors || [];
      const paginationData = data.pagination || data.data?.pagination || {};

      setVerifications(tutors);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.totalItems || paginationData.total || 0,
        pages: paginationData.totalPages || paginationData.pages || 1,
      }));
    } catch (err) {
      console.error("Error fetching verifications:", err);
      setError("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));

    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVerifications();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "needs_info":
        return "status-info";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="verification-queue">
        <div className="page-header">
          <div className="header-content">
            <h2>Tutor Verification Queue</h2>
            <p className="text-muted">
              Review and verify tutor applications and documents
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </form>

          <div className="filter-tabs">
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "needs_info", label: "Needs Info" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`filter-tab ${
                  filters.status === tab.value ? "active" : ""
                }`}
                onClick={() => handleFilterChange("status", tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading verifications...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchVerifications}>
              Try Again
            </button>
          </div>
        ) : verifications.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>No Verification Requests</h3>
            <p>
              {filters.status === "all"
                ? "There are no tutor verification requests at the moment."
                : `No ${filters.status} verification requests found.`}
            </p>
          </div>
        ) : (
          <>
            <div className="verification-grid">
              {verifications.map((tutor) => (
                <div key={tutor._id} className="verification-card">
                  <div className="card-header">
                    <div className="tutor-info">
                      <div className="tutor-avatar">
                        {tutor.user?.profileImage ? (
                          <img
                            src={tutor.user.profileImage}
                            alt={tutor.user?.name}
                          />
                        ) : (
                          <span>
                            {tutor.user?.name?.charAt(0)?.toUpperCase() || "T"}
                          </span>
                        )}
                      </div>
                      <div className="tutor-details">
                        <h4>{tutor.user?.name || "Unknown"}</h4>
                        <p>{tutor.user?.email || "N/A"}</p>
                      </div>
                    </div>
                    <span
                      className={`status-badge ${getStatusClass(
                        tutor.verificationStatus
                      )}`}
                    >
                      {tutor.verificationStatus}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <i className="bi bi-mortarboard"></i>
                        <span>{tutor.qualification || "Not specified"}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-building"></i>
                        <span>{tutor.universityName || "Not specified"}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-bookmark"></i>
                        <span>{tutor.specialization || "Not specified"}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-calendar3"></i>
                        <span>Submitted: {formatDate(tutor.createdAt)}</span>
                      </div>
                    </div>

                    <div className="document-badges">
                      {tutor.idDocument && (
                        <span className="doc-badge">
                          <i className="bi bi-file-earmark-check"></i> ID Proof
                        </span>
                      )}
                      {tutor.qualificationDocument && (
                        <span className="doc-badge">
                          <i className="bi bi-file-earmark-check"></i>{" "}
                          Qualification
                        </span>
                      )}
                      {!tutor.idDocument && !tutor.qualificationDocument && (
                        <span className="doc-badge doc-missing">
                          <i className="bi bi-file-earmark-x"></i> No Documents
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <Link
                      to={`/admin/verifications/${tutor._id}`}
                      className="btn btn-primary"
                    >
                      Review Application
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="btn btn-outline-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default VerificationQueue;
