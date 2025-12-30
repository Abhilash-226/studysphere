/**
 * MyClassroomsPage
 * Tutors can view and manage their offline classrooms
 */

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Dropdown,
  Modal,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaChalkboardTeacher,
  FaEllipsisV,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import offlineClassroomService from "../../../shared/services/offlineClassroom.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./MyClassroomsPage.css";

const MyClassroomsPage = () => {
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    classroom: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyClassrooms();
  }, []);

  const fetchMyClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offlineClassroomService.getMyClassrooms();
      if (response.success) {
        setClassrooms(response.classrooms || []);
      } else {
        setError("Failed to load your classrooms");
      }
    } catch (err) {
      setError("Failed to load classrooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (classroom) => {
    try {
      setActionLoading(classroom.id);
      const newStatus = classroom.status === "active" ? "inactive" : "active";
      const response = await offlineClassroomService.toggleStatus(
        classroom.id,
        newStatus
      );
      if (response.success) {
        setClassrooms((prev) =>
          prev.map((c) =>
            c.id === classroom.id ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.classroom) return;

    try {
      setDeleting(true);
      const response = await offlineClassroomService.deleteClassroom(
        deleteModal.classroom.id
      );
      if (response.success) {
        setClassrooms((prev) =>
          prev.filter((c) => c.id !== deleteModal.classroom.id)
        );
        setDeleteModal({ show: false, classroom: null });
      }
    } catch (err) {
      setError("Failed to delete classroom");
    } finally {
      setDeleting(false);
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge bg="success">
            <FaCheckCircle className="me-1" /> Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge bg="secondary">
            <FaEyeSlash className="me-1" /> Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge bg="warning">
            <FaExclamationCircle className="me-1" /> Pending
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="my-classrooms-page">
      <Container>
        <div className="page-header">
          <div>
            <h1>
              <FaChalkboardTeacher className="me-3" />
              My Classrooms
            </h1>
            <p className="text-muted">Manage your offline classroom listings</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/tutor/classrooms/create")}
          >
            <FaPlus className="me-2" />
            Add Classroom
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading your classrooms...</p>
          </div>
        ) : classrooms.length === 0 ? (
          /* Empty State */
          <Card className="empty-state">
            <FaChalkboardTeacher size={60} />
            <h4>No Classrooms Yet</h4>
            <p>
              Create your first offline classroom listing to attract students
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/tutor/classrooms/create")}
            >
              <FaPlus className="me-2" />
              Create Classroom
            </Button>
          </Card>
        ) : (
          /* Classrooms List - Horizontal Cards */
          <div className="classroom-list">
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="classroom-card-horizontal">
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
                        <FaChalkboardTeacher />
                      </div>
                    )}
                    <div className="status-badge-overlay">
                      {getStatusBadge(classroom.status)}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="classroom-card__content">
                  <div className="classroom-card__header">
                    <h5 className="classroom-card__name">{classroom.name}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <Badge
                        bg="light"
                        text="dark"
                        className="classroom-card__batch-type"
                      >
                        <FaUsers className="me-1" />
                        {classroom.batchInfo?.batchType === "individual"
                          ? "Individual"
                          : `Max ${classroom.batchInfo?.maxStudents} students`}
                      </Badge>
                      <Dropdown>
                        <Dropdown.Toggle as="span" className="actions-toggle">
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item
                            onClick={() =>
                              navigate(`/tutor/classrooms/${classroom.id}/edit`)
                            }
                          >
                            <FaEdit className="me-2" />
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleToggleStatus(classroom)}
                            disabled={actionLoading === classroom.id}
                          >
                            {classroom.status === "active" ? (
                              <>
                                <FaEyeSlash className="me-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <FaEye className="me-2" />
                                Activate
                              </>
                            )}
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() =>
                              setDeleteModal({ show: true, classroom })
                            }
                          >
                            <FaTrash className="me-2" />
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>

                  <div className="classroom-card__stats">
                    <div className="classroom-card__stat">
                      <FaMapMarkerAlt />
                      <span>
                        {classroom.location?.area}, {classroom.location?.city}
                      </span>
                    </div>
                    <div className="classroom-card__stat">
                      <FaClock />
                      <span>
                        {classroom.schedule?.startTime} -{" "}
                        {classroom.schedule?.endTime}
                      </span>
                    </div>
                    <div className="classroom-card__stat">
                      <FaUsers />
                      <span>
                        {classroom.batchInfo?.currentStudents || 0}/
                        {classroom.batchInfo?.maxStudents} enrolled
                      </span>
                    </div>
                  </div>

                  <div className="classroom-card__subjects">
                    {classroom.subjects?.slice(0, 4).map((subject) => (
                      <span key={subject} className="classroom-card__subject">
                        {subject}
                      </span>
                    ))}
                    {classroom.subjects?.length > 4 && (
                      <span className="classroom-card__subject classroom-card__subject--more">
                        +{classroom.subjects.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="classroom-card__footer">
                    <div className="classroom-card__price">
                      {formatFee(classroom.feeStructure)}
                    </div>
                    <div className="classroom-card__actions-row">
                      <span className="stat-item">
                        <FaEye className="me-1" /> {classroom.stats?.views || 0}{" "}
                        views
                      </span>
                      <span className="stat-item">
                        <FaUsers className="me-1" />{" "}
                        {classroom.stats?.inquiries || 0} inquiries
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, classroom: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Classroom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{deleteModal.classroom?.name}"? This
          action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, classroom: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyClassroomsPage;
