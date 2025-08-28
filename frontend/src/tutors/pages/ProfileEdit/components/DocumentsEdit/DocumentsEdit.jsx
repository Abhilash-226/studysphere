import React, { useState } from "react";
import { Form, Button, ListGroup, Card, Row, Col } from "react-bootstrap";
import { FaFileAlt, FaUpload, FaTrash, FaCheck } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./DocumentsEdit.css";

/**
 * DocumentsEdit - Component for editing documents
 * @param {Object} props - Component props
 * @param {Array} props.documents - Current documents array
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const DocumentsEdit = ({ documents = [], onSave, onCancel }) => {
  const [documentsList, setDocumentsList] = useState(documents);
  const [newDocument, setNewDocument] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("certificate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument(e.target.files[0]);
      // Use the file name as the default document name if not provided
      if (!documentName) {
        setDocumentName(e.target.files[0].name.split(".")[0]);
      }
    }
  };

  const handleAddDocument = () => {
    if (!newDocument || !documentName) return;

    // In a real implementation, you would upload the file to the server here
    // For demonstration, we'll simulate adding the document to the list
    const newDocumentItem = {
      id: Date.now(),
      name: documentName,
      type: documentType,
      fileName: newDocument.name,
      // In real implementation, this would be the URL from the server
      url: URL.createObjectURL(newDocument),
      dateUploaded: new Date().toISOString(),
    };

    setDocumentsList([...documentsList, newDocumentItem]);
    setNewDocument(null);
    setDocumentName("");
    setDocumentType("certificate");
  };

  const handleRemoveDocument = (id) => {
    setDocumentsList(documentsList.filter((doc) => doc.id !== id));
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    // In a real implementation, you'd upload any new files first
    // then send the updated document list to the server

    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
        // Call the onSave function with the section name and the updated data
        onSave("documents", { documents: documentsList }).finally(() => {
          setIsSubmitting(false);
          setUploadProgress(0);
        });
      }
    }, 500);
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case "certificate":
        return "Certificate";
      case "degree":
        return "Degree";
      case "license":
        return "License";
      case "identification":
        return "ID Document";
      default:
        return "Other Document";
    }
  };

  return (
    <EditSection
      title="Edit Documents"
      icon={<FaFileAlt />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <div className="mb-4">
        <h5 className="mb-3">Your Documents</h5>
        {documentsList.length === 0 ? (
          <p className="text-muted">No documents uploaded yet.</p>
        ) : (
          <ListGroup variant="flush" className="document-list mb-4">
            {documentsList.map((document) => (
              <ListGroup.Item
                key={document.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{document.name}</div>
                  <div className="text-muted small">
                    {getDocumentTypeLabel(document.type)} •{" "}
                    {new Date(document.dateUploaded).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  {document.verified && (
                    <span className="text-success me-3">
                      <FaCheck /> Verified
                    </span>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveDocument(document.id)}
                    disabled={document.verified}
                  >
                    <FaTrash /> Remove
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <h5 className="mb-3">Upload New Document</h5>
        <Card className="p-3 mb-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Document Name</Form.Label>
                <Form.Control
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. Teaching Certificate"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Document Type</Form.Label>
                <Form.Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                >
                  <option value="certificate">Certificate</option>
                  <option value="degree">Degree</option>
                  <option value="license">License</option>
                  <option value="identification">ID Document</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Upload File</Form.Label>
            <div className="upload-container">
              <input
                type="file"
                id="document-upload"
                className="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="document-upload" className="upload-label">
                <FaUpload className="me-2" />
                {newDocument ? newDocument.name : "Choose a file..."}
              </label>
            </div>
            <Form.Text className="text-muted">
              Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleAddDocument}
              disabled={!newDocument || !documentName}
            >
              <FaUpload className="me-2" /> Upload Document
            </Button>
          </div>
        </Card>

        {isSubmitting && uploadProgress > 0 && (
          <div className="upload-progress-container">
            <div className="upload-progress-label">Uploading documents...</div>
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="upload-progress-percentage">{uploadProgress}%</div>
          </div>
        )}
      </div>
    </EditSection>
  );
};

export default DocumentsEdit;
