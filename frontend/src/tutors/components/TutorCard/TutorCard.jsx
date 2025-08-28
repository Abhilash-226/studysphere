import React from "react";
import { Link } from "react-router-dom";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./TutorCard.css";

/**
 * A reusable tutor card component for displaying tutor information
 *
 * @param {Object} props
 * @param {Object} props.tutor - Tutor data to display
 * @param {Boolean} props.expanded - Whether to show the expanded view with more details
 */
const TutorCard = ({ tutor, expanded = false }) => {
  return (
    <div className={`tutor-card-detailed ${expanded ? "expanded" : ""}`}>
      <div className="tutor-card-left">
        <div className="tutor-avatar">
          <img
            src={formatImageUrl(tutor.image)}
            alt={tutor.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/tutors/tutor-placeholder.svg";
            }}
          />
          {tutor.rating ? (
            <div className="tutor-rating-badge">
              <span>{tutor.rating}</span>
              <i className="star-icon">★</i>
            </div>
          ) : null}
        </div>

        {expanded && (
          <div className="tutor-reviews">
            {tutor.rating ? (
              <span className="reviews-count">
                {tutor.reviews || 0} reviews
              </span>
            ) : (
              <span className="no-reviews">No reviews yet</span>
            )}
          </div>
        )}
      </div>

      <div className="tutor-card-content">
        <div className="tutor-card-header">
          <h3 className="tutor-name">{tutor.name}</h3>
          <div className="tutor-tags">
            {tutor.teachingMode && (
              <>
                {Array.isArray(tutor.teachingMode) ? (
                  tutor.teachingMode.map((mode) => (
                    <span
                      key={mode}
                      className={`tutor-tag teaching-mode ${mode}`}
                    >
                      {mode === "online_individual"
                        ? "Online (Individual)"
                        : mode === "online_group"
                        ? "Online (Group)"
                        : mode === "offline_home"
                        ? "In-Person (Home)"
                        : "In-Person (Classroom)"}
                    </span>
                  ))
                ) : (
                  <span
                    className={`tutor-tag teaching-mode ${tutor.teachingMode}`}
                  >
                    {tutor.teachingMode === "online_individual"
                      ? "Online (Individual)"
                      : tutor.teachingMode === "online_group"
                      ? "Online (Group)"
                      : tutor.teachingMode === "offline_home"
                      ? "In-Person (Home)"
                      : tutor.teachingMode === "offline_classroom"
                      ? "In-Person (Classroom)"
                      : "Mixed"}
                  </span>
                )}
              </>
            )}
            {parseFloat(tutor.rating) >= 4.5 && (
              <span className="tutor-tag top-rated">Top Rated</span>
            )}
          </div>
        </div>

        <p className="tutor-specialization">{tutor.specialization}</p>

        {expanded && (
          <>
            <p className="tutor-qualification">
              {tutor.qualification}
              {tutor.experience && ` • ${tutor.experience} years experience`}
            </p>

            {tutor.university && (
              <p className="tutor-university">
                <span className="university-label">University:</span>{" "}
                {tutor.university}
              </p>
            )}

            {tutor.location && tutor.location.city && (
              <p className="tutor-location">
                <span className="location-label">Location:</span>{" "}
                {tutor.location.city}
                {tutor.location.state && `, ${tutor.location.state}`}
                {tutor.location.country && `, ${tutor.location.country}`}
              </p>
            )}

            {tutor.availability && tutor.availability.length > 0 && (
              <div className="tutor-availability">
                <span className="availability-label">Available:</span>
                <div className="availability-days">
                  {tutor.availability.map((slot, index) => (
                    <span key={index} className="availability-slot">
                      {slot.day} ({slot.startTime} - {slot.endTime})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tutor.bio && (
              <p className="tutor-bio">
                {tutor.bio.length > 150
                  ? `${tutor.bio.substring(0, 150)}...`
                  : tutor.bio}
              </p>
            )}
          </>
        )}

        <div className="tutor-card-footer">
          <div className="tutor-price">
            <span className="price-amount">${tutor.hourlyRate || 25}</span>
            <span className="price-unit">/hour</span>
          </div>

          <div className="tutor-actions">
            <Link to={`/tutors/${tutor.id}`} className="btn btn-primary">
              View Profile
            </Link>
            <Link to={`/book/${tutor.id}`} className="btn btn-secondary">
              Book Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
