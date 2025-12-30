/**
 * CreateClassroomPage
 * Form for tutors to create a new offline classroom listing
 */

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaChalkboardTeacher,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPlus,
  FaMapMarkerAlt,
  FaClock,
  FaRupeeSign,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import offlineClassroomService from "../../../shared/services/offlineClassroom.service";
import "./CreateClassroomPage.css";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const FEE_PERIODS = [
  { value: "per_session", label: "Per Session" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const BATCH_TYPES = [
  { value: "individual", label: "Individual Classes" },
  { value: "group", label: "Group Classes" },
  { value: "both", label: "Both Individual & Group" },
];

const COMMON_FACILITIES = [
  "AC",
  "WiFi",
  "Parking",
  "Library",
  "Study Material",
  "Projector",
  "Whiteboard",
  "Drinking Water",
];

const CreateClassroomPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subjects: [],
    targetGrades: [],
    feeStructure: {
      amount: "",
      period: "monthly",
    },
    location: {
      address: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
    },
    batchInfo: {
      maxStudents: "",
      batchType: "group",
    },
    contactInfo: {
      phone: "",
      whatsapp: "",
      email: "",
      preferredContact: "whatsapp",
    },
    facilities: [],
  });

  const [subjectInput, setSubjectInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleAddSubject = () => {
    if (
      subjectInput.trim() &&
      !formData.subjects.includes(subjectInput.trim())
    ) {
      handleChange("subjects", [...formData.subjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (subject) => {
    handleChange(
      "subjects",
      formData.subjects.filter((s) => s !== subject)
    );
  };

  const handleAddGrade = () => {
    if (
      gradeInput.trim() &&
      !formData.targetGrades.includes(gradeInput.trim())
    ) {
      handleChange("targetGrades", [
        ...formData.targetGrades,
        gradeInput.trim(),
      ]);
      setGradeInput("");
    }
  };

  const handleRemoveGrade = (grade) => {
    handleChange(
      "targetGrades",
      formData.targetGrades.filter((g) => g !== grade)
    );
  };

  const handleDayToggle = (day) => {
    const currentDays = formData.schedule.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    handleNestedChange("schedule", "days", newDays);
  };

  const handleFacilityToggle = (facility) => {
    const currentFacilities = formData.facilities;
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    handleChange("facilities", newFacilities);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Classroom name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.subjects.length === 0)
      newErrors.subjects = "At least one subject is required";
    if (!formData.feeStructure.amount)
      newErrors.feeAmount = "Fee amount is required";
    if (!formData.location.address.trim())
      newErrors.address = "Address is required";
    if (!formData.location.city.trim()) newErrors.city = "City is required";
    if (!formData.location.pincode.trim())
      newErrors.pincode = "Pincode is required";
    if (formData.schedule.days.length === 0)
      newErrors.days = "Select at least one day";
    if (!formData.schedule.startTime)
      newErrors.startTime = "Start time is required";
    if (!formData.schedule.endTime) newErrors.endTime = "End time is required";
    if (
      formData.batchInfo.batchType !== "individual" &&
      !formData.batchInfo.maxStudents
    ) {
      newErrors.maxStudents = "Max students is required for group classes";
    }
    if (
      !formData.contactInfo.phone &&
      !formData.contactInfo.whatsapp &&
      !formData.contactInfo.email
    ) {
      newErrors.contact = "At least one contact method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        ...formData,
        feeStructure: {
          amount: Number(formData.feeStructure.amount),
          period: formData.feeStructure.period,
        },
        batchInfo: {
          ...formData.batchInfo,
          maxStudents:
            formData.batchInfo.batchType === "individual"
              ? 1
              : Number(formData.batchInfo.maxStudents),
        },
      };

      const response = await offlineClassroomService.createClassroom(
        submitData
      );

      if (response.success) {
        navigate("/tutor/my-classrooms", {
          state: { message: "Classroom created successfully!" },
        });
      } else {
        setSubmitError(response.message || "Failed to create classroom");
      }
    } catch (err) {
      setSubmitError("Failed to create classroom. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-classroom-page">
      <Container>
        <Button
          variant="link"
          className="back-button"
          onClick={() => navigate("/tutor/my-classrooms")}
        >
          <FaArrowLeft className="me-2" />
          Back to My Classrooms
        </Button>

        <div className="page-header">
          <h1>
            <FaChalkboardTeacher className="me-3" />
            Create New Classroom
          </h1>
          <p className="text-muted">
            Fill in the details to list your offline classroom
          </p>
        </div>

        {submitError && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setSubmitError(null)}
          >
            {submitError}
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="warning">
            Please fix the errors below before submitting.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              {/* Basic Info */}
              <Card className="form-section mb-4">
                <h5>Basic Information</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Classroom Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., ABC Coaching Classes"
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe your classroom, teaching methodology, what makes it special..."
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Subjects */}
                <Form.Group className="mb-3">
                  <Form.Label>Subjects *</Form.Label>
                  <div className="input-with-button">
                    <Form.Control
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="Add a subject"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                      isInvalid={!!errors.subjects}
                    />
                    <Button
                      variant="outline-primary"
                      onClick={handleAddSubject}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                  {errors.subjects && (
                    <div className="text-danger small mt-1">
                      {errors.subjects}
                    </div>
                  )}
                  <div className="tags-container mt-2">
                    {formData.subjects.map((subject) => (
                      <Badge key={subject} bg="primary" className="tag-badge">
                        {subject}
                        <FaTimes
                          className="ms-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveSubject(subject)}
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>

                {/* Target Grades */}
                <Form.Group className="mb-3">
                  <Form.Label>Target Grades/Classes</Form.Label>
                  <div className="input-with-button">
                    <Form.Control
                      type="text"
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      placeholder="e.g., Class 10, Class 12, JEE"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGrade();
                        }
                      }}
                    />
                    <Button variant="outline-primary" onClick={handleAddGrade}>
                      <FaPlus />
                    </Button>
                  </div>
                  <div className="tags-container mt-2">
                    {formData.targetGrades.map((grade) => (
                      <Badge key={grade} bg="secondary" className="tag-badge">
                        {grade}
                        <FaTimes
                          className="ms-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveGrade(grade)}
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Card>

              {/* Location */}
              <Card className="form-section mb-4">
                <h5>
                  <FaMapMarkerAlt className="me-2" />
                  Location
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label>Full Address *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      handleNestedChange("location", "address", e.target.value)
                    }
                    placeholder="Street address, building name, etc."
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Area/Locality</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.location.area}
                        onChange={(e) =>
                          handleNestedChange("location", "area", e.target.value)
                        }
                        placeholder="e.g., Koramangala"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.location.city}
                        onChange={(e) =>
                          handleNestedChange("location", "city", e.target.value)
                        }
                        placeholder="e.g., Bangalore"
                        isInvalid={!!errors.city}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.location.state}
                        onChange={(e) =>
                          handleNestedChange(
                            "location",
                            "state",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Karnataka"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.location.pincode}
                        onChange={(e) =>
                          handleNestedChange(
                            "location",
                            "pincode",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 560001"
                        isInvalid={!!errors.pincode}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.pincode}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location.landmark}
                    onChange={(e) =>
                      handleNestedChange("location", "landmark", e.target.value)
                    }
                    placeholder="e.g., Near City Mall"
                  />
                </Form.Group>
              </Card>

              {/* Schedule */}
              <Card className="form-section mb-4">
                <h5>
                  <FaClock className="me-2" />
                  Schedule
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label>Class Days *</Form.Label>
                  <div className="days-selector">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day.value}
                        variant={
                          formData.schedule.days.includes(day.value)
                            ? "primary"
                            : "outline-secondary"
                        }
                        className="day-button"
                        onClick={() => handleDayToggle(day.value)}
                        type="button"
                      >
                        {day.label.substring(0, 3)}
                      </Button>
                    ))}
                  </div>
                  {errors.days && (
                    <div className="text-danger small mt-1">{errors.days}</div>
                  )}
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time *</Form.Label>
                      <Form.Control
                        type="time"
                        value={formData.schedule.startTime}
                        onChange={(e) =>
                          handleNestedChange(
                            "schedule",
                            "startTime",
                            e.target.value
                          )
                        }
                        isInvalid={!!errors.startTime}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.startTime}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time *</Form.Label>
                      <Form.Control
                        type="time"
                        value={formData.schedule.endTime}
                        onChange={(e) =>
                          handleNestedChange(
                            "schedule",
                            "endTime",
                            e.target.value
                          )
                        }
                        isInvalid={!!errors.endTime}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.endTime}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card>

              {/* Facilities */}
              <Card className="form-section mb-4">
                <h5>Facilities</h5>
                <div className="facilities-selector">
                  {COMMON_FACILITIES.map((facility) => (
                    <Button
                      key={facility}
                      variant={
                        formData.facilities.includes(facility)
                          ? "primary"
                          : "outline-secondary"
                      }
                      className="facility-button"
                      onClick={() => handleFacilityToggle(facility)}
                      type="button"
                    >
                      {facility}
                    </Button>
                  ))}
                </div>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              {/* Fee Structure */}
              <Card className="form-section mb-4">
                <h5>
                  <FaRupeeSign className="me-2" />
                  Fee Structure
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label>Fee Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.feeStructure.amount}
                    onChange={(e) =>
                      handleNestedChange(
                        "feeStructure",
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 5000"
                    isInvalid={!!errors.feeAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.feeAmount}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fee Period</Form.Label>
                  <Form.Select
                    value={formData.feeStructure.period}
                    onChange={(e) =>
                      handleNestedChange(
                        "feeStructure",
                        "period",
                        e.target.value
                      )
                    }
                  >
                    {FEE_PERIODS.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card>

              {/* Batch Info */}
              <Card className="form-section mb-4">
                <h5>Batch Information</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Batch Type</Form.Label>
                  <Form.Select
                    value={formData.batchInfo.batchType}
                    onChange={(e) =>
                      handleNestedChange(
                        "batchInfo",
                        "batchType",
                        e.target.value
                      )
                    }
                  >
                    {BATCH_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {formData.batchInfo.batchType !== "individual" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Students *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.batchInfo.maxStudents}
                      onChange={(e) =>
                        handleNestedChange(
                          "batchInfo",
                          "maxStudents",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 20"
                      isInvalid={!!errors.maxStudents}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.maxStudents}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
              </Card>

              {/* Contact Info */}
              <Card className="form-section mb-4">
                <h5>Contact Information</h5>
                <p className="text-muted small">
                  At least one contact method is required
                </p>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPhone className="me-2" />
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      handleNestedChange("contactInfo", "phone", e.target.value)
                    }
                    placeholder="e.g., 9876543210"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaWhatsapp className="me-2 text-success" />
                    WhatsApp Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.contactInfo.whatsapp}
                    onChange={(e) =>
                      handleNestedChange(
                        "contactInfo",
                        "whatsapp",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 9876543210"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      handleNestedChange("contactInfo", "email", e.target.value)
                    }
                    placeholder="e.g., tutor@example.com"
                  />
                </Form.Group>

                {errors.contact && (
                  <div className="text-danger small">{errors.contact}</div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Preferred Contact Method</Form.Label>
                  <Form.Select
                    value={formData.contactInfo.preferredContact}
                    onChange={(e) =>
                      handleNestedChange(
                        "contactInfo",
                        "preferredContact",
                        e.target.value
                      )
                    }
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                  </Form.Select>
                </Form.Group>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Create Classroom
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default CreateClassroomPage;
