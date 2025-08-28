import React from "react";
import { Card, Badge, ListGroup } from "react-bootstrap";
import { FaFileAlt } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./DocumentsSection.css";

/**
 * DocumentsSection - Section component for displaying tutor documents
 * @param {Object} props - Component props
 * @param {Object} props.documents - Tutor documents info
 * @param {boolean} props.documents.idDocument - Whether ID document is uploaded
 * @param {boolean} props.documents.qualificationDocument - Whether qualification document is uploaded
 * @param {boolean} props.documents.markSheet - Whether mark sheet is uploaded
 * @param {boolean} props.documents.experienceCertificate - Whether experience certificate is uploaded
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const DocumentsSection = ({ documents = {}, onEdit }) => {
  const {
    idDocument,
    qualificationDocument,
    markSheet,
    experienceCertificate,
  } = documents;

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="card-header-content">
          <div className="title">
            <FaFileAlt />
            <span>Documents</span>
          </div>
          <EditButton
            section="documents"
            title="Edit documents"
            onEdit={onEdit}
          />
        </div>
      </Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item
          className={idDocument ? "has-document" : "missing-document"}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>ID Document</span>
            <Badge
              bg={idDocument ? "success" : "secondary"}
              className="py-2 px-3"
            >
              {idDocument ? "Uploaded" : "Missing"}
            </Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item
          className={
            qualificationDocument ? "has-document" : "missing-document"
          }
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>Qualification Document</span>
            <Badge
              bg={qualificationDocument ? "success" : "secondary"}
              className="py-2 px-3"
            >
              {qualificationDocument ? "Uploaded" : "Missing"}
            </Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item
          className={markSheet ? "has-document" : "missing-document"}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>Mark Sheet</span>
            <Badge
              bg={markSheet ? "success" : "secondary"}
              className="py-2 px-3"
            >
              {markSheet ? "Uploaded" : "Missing"}
            </Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item
          className={
            experienceCertificate ? "has-document" : "missing-document"
          }
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>Experience Certificate</span>
            <Badge
              bg={experienceCertificate ? "success" : "secondary"}
              className="py-2 px-3"
            >
              {experienceCertificate ? "Uploaded" : "Optional"}
            </Badge>
          </div>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default DocumentsSection;
