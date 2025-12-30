/**
 * ClassroomsPage
 * Browse offline/physical classrooms near you
 * Students can search and contact tutors directly
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Spinner,
  Alert,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaRupeeSign,
  FaFilter,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaBook,
  FaSortAmountDown,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import offlineClassroomService from "../../services/offlineClassroom.service";
import { formatImageUrl } from "../../utils/imageUtils";
import "./ClassroomsPage.css";

const ClassroomsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClassrooms: 0,
  });

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [batchType, setBatchType] = useState(
    searchParams.get("batchType") || ""
  );
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter options
  const [cities, setCities] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch classrooms when filters change
  useEffect(() => {
    fetchClassrooms();
  }, [
    city,
    selectedSubjects,
    batchType,
    sortBy,
    sortOrder,
    pagination.currentPage,
  ]);

  const fetchFilterOptions = async () => {
    try {
      const [citiesRes, subjectsRes] = await Promise.all([
        offlineClassroomService.getCities(),
        offlineClassroomService.getSubjects(),
      ]);
      if (citiesRes.success) setCities(citiesRes.cities || []);
      if (subjectsRes.success) setSubjects(subjectsRes.subjects || []);
    } catch (err) {
      // Silent fail for filter options
    }
  };

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: search || undefined,
        city: city || undefined,
        subjects:
          selectedSubjects.length > 0 ? selectedSubjects.join(",") : undefined,
        batchType: batchType || undefined,
        sortBy,
        sortOrder,
      };

      const response = await offlineClassroomService.getClassrooms(params);

      if (response.success) {
        setClassrooms(response.classrooms || []);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalClassrooms: response.pagination.totalClassrooms,
        });
      } else {
        setError("Failed to load classrooms");
      }
    } catch (err) {
      setError("Failed to load classrooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    city,
    selectedSubjects,
    batchType,
    sortBy,
    sortOrder,
    pagination.currentPage,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchClassrooms();
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleViewDetails = (classroom) => {
    navigate(`/classrooms/${classroom.slug || classroom.id}`);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "";
    const days = schedule.days
      ?.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
      .join(", ");
    return `${days} | ${schedule.startTime} - ${schedule.endTime}`;
  };

  const formatFee = (feeStructure) => {
    if (!feeStructure) return "";
    const periodLabels = {
      per_session: "/session",
      weekly: "/week",
      monthly: "/month",
      quarterly: "/quarter",
      yearly: "/year",
    };
    return `₹${feeStructure.amount?.toLocaleString()}${
      periodLabels[feeStructure.period] || ""
    }`;
  };

  return (
    <div className="classrooms-page">
      {/* Hero Section */}
      <div className="classrooms-hero">
        <Container>
          <h1>
            <FaChalkboardTeacher className="me-2" />
            Find Classrooms Near You
          </h1>
          <p>Discover quality offline coaching classes in your area</p>
        </Container>
      </div>

      <Container>
        {/* Search Section */}
        <Card className="search-section mb-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, subject, or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button type="submit" variant="primary" className="w-100">
                  <FaSearch className="me-2" />
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3}>
            <Card className="filters-section">
              <h6>
                <FaFilter className="me-2" />
                Filters
              </h6>

              {/* Batch Type */}
              <div className="mb-3">
                <small className="text-muted d-block mb-2">Batch Type</small>
                <div className="filter-chips">
                  {["group", "individual", "both"].map((type) => (
                    <span
                      key={type}
                      className={`filter-chip ${
                        batchType === type ? "active" : ""
                      }`}
                      onClick={() => {
                        setBatchType(batchType === type ? "" : type);
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              {subjects.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Subjects</small>
                  <div className="filter-chips">
                    {subjects.slice(0, 10).map((subject) => (
                      <span
                        key={subject}
                        className={`filter-chip ${
                          selectedSubjects.includes(subject) ? "active" : ""
                        }`}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(city || selectedSubjects.length > 0 || batchType) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100"
                  onClick={() => {
                    setCity("");
                    setSelectedSubjects([]);
                    setBatchType("");
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </Col>

          {/* Results */}
          <Col lg={9}>
            {/* Results Header */}
            <div className="results-header">
              <span className="results-count">
                {pagination.totalClassrooms} classroom
                {pagination.totalClassrooms !== 1 ? "s" : ""} found
              </span>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <FaSortAmountDown className="me-2" />
                  Sort by
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      setSortBy("createdAt");
                      setSortOrder("desc");
                    }}
                  >
                    Newest First
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSortBy("feeStructure.amount");
                      setSortOrder("asc");
                    }}
                  >
                    Fee: Low to High
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSortBy("feeStructure.amount");
                      setSortOrder("desc");
                    }}
                  >
                    Fee: High to Low
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSortBy("stats.views");
                      setSortOrder("desc");
                    }}
                  >
                    Most Popular
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Error State */}
            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="loading-container">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading classrooms...</p>
              </div>
            ) : classrooms.length === 0 ? (
              /* No Results */
              <div className="no-results">
                <FaChalkboardTeacher />
                <h5>No classrooms found</h5>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              /* Classroom List - Horizontal Cards */
              <>
                <div className="classroom-list">
                  {classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="classroom-card-horizontal"
                    >
                      {/* Left Section - Image */}
                      <div className="classroom-card__left">
                        <div className="classroom-card__image-wrapper">
                          {classroom.images && classroom.images[0] ? (
                            <img
                              src={formatImageUrl(classroom.images[0])}
                              alt={classroom.name}
                              className="classroom-card__image"
                            />
                          ) : (
                            <div className="classroom-card__placeholder">
                              <FaBook />
                            </div>
                          )}
                          {classroom.isVerified && (
                            <span className="classroom-card__verified">
                              <FaCheckCircle /> Verified
                            </span>
                          )}
                        </div>

                        {/* Tutor info under image */}
                        {classroom.tutor && (
                          <div className="classroom-card__tutor">
                            <img
                              src={formatImageUrl(classroom.tutor.profileImage)}
                              alt={classroom.tutor.name}
                              onError={(e) => {
                                e.target.src = "/images/avatar-placeholder.jpg";
                              }}
                            />
                            <span>{classroom.tutor.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Content */}
                      <div className="classroom-card__content">
                        <div className="classroom-card__header">
                          <h3 className="classroom-card__name">
                            {classroom.name}
                          </h3>
                          <span className="classroom-card__batch-type">
                            <FaUsers />
                            {classroom.batchInfo?.batchType === "individual"
                              ? "Individual"
                              : classroom.batchInfo?.batchType === "group"
                              ? "Group Class"
                              : "Individual & Group"}
                          </span>
                        </div>

                        {/* Location & Schedule Stats */}
                        <div className="classroom-card__stats">
                          <div className="classroom-card__stat">
                            <FaMapMarkerAlt />
                            <span>
                              {classroom.location?.area},{" "}
                              {classroom.location?.city}
                            </span>
                          </div>
                          <div className="classroom-card__stat">
                            <FaClock />
                            <span>{formatSchedule(classroom.schedule)}</span>
                          </div>
                          {classroom.batchInfo?.batchType !== "individual" && (
                            <div className="classroom-card__stat">
                              <FaUsers />
                              <span>
                                Max {classroom.batchInfo?.maxStudents} students
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Subjects */}
                        <div className="classroom-card__subjects">
                          {classroom.subjects?.slice(0, 4).map((subject) => (
                            <span
                              key={subject}
                              className="classroom-card__subject"
                            >
                              {subject}
                            </span>
                          ))}
                          {classroom.subjects?.length > 4 && (
                            <span className="classroom-card__subject classroom-card__subject--more">
                              +{classroom.subjects.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Footer - Price & Action */}
                        <div className="classroom-card__footer">
                          <div className="classroom-card__price">
                            <span className="classroom-card__price-amount">
                              {formatFee(classroom.feeStructure)}
                            </span>
                          </div>
                          <div className="classroom-card__actions">
                            <Button
                              variant="outline-primary"
                              className="classroom-card__btn"
                              onClick={() => handleViewDetails(classroom)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    <Pagination>
                      <Pagination.Prev
                        disabled={pagination.currentPage === 1}
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                      />
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={pagination.currentPage === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ClassroomsPage;
