import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaClock,
  FaVideo,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./TutorCard.css";

/**
 * A reusable tutor card component for displaying tutor information
 */
const TutorCard = ({ tutor, expanded = false }) => {
  const navigate = useNavigate();

  // Check teaching modes
  const hasOnlineMode =
    tutor.teachingMode &&
    (Array.isArray(tutor.teachingMode)
      ? tutor.teachingMode.some(
          (mode) => mode === "online" || mode.startsWith("online_")
        )
      : tutor.teachingMode === "online" ||
        tutor.teachingMode.startsWith("online_"));

  const hasOfflineMode =
    tutor.teachingMode &&
    (Array.isArray(tutor.teachingMode)
      ? tutor.teachingMode.some(
          (mode) => mode === "offline" || mode.startsWith("offline_")
        )
      : tutor.teachingMode === "offline" ||
        tutor.teachingMode.startsWith("offline_"));

  const handleBookSession = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let subjects = [];
    if (tutor.subjects && Array.isArray(tutor.subjects)) {
      subjects = tutor.subjects;
    } else if (tutor.specialization) {
      subjects = [tutor.specialization];
    }

    navigate(`/book/${tutor.id}`, {
      state: {
        tutor: {
          id: tutor.id,
          name: tutor.name,
          profileImage: tutor.image || tutor.profileImage,
          hourlyRate: tutor.hourlyRate || 500,
          subjects: subjects,
          bio: tutor.bio,
          rating: tutor.rating,
          experience: tutor.experience,
          university: tutor.university,
          location: tutor.location,
          teachingMode: tutor.teachingMode,
        },
      },
    });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/images/tutors/tutor-placeholder.svg";
  };

  // Get subjects to display
  const getSubjects = () => {
    if (tutor.subjects && Array.isArray(tutor.subjects)) {
      return tutor.subjects.slice(0, 3);
    }
    if (tutor.specialization) {
      return [tutor.specialization];
    }
    return [];
  };

  const subjects = getSubjects();

  return (
    <div className={`tutor-card ${expanded ? "tutor-card--expanded" : ""}`}>
      {/* Left Section - Avatar & Quick Info */}
      <div className="tutor-card__left">
        <div className="tutor-card__avatar-wrapper">
          <img
            src={formatImageUrl(tutor.image || tutor.profileImage)}
            alt={tutor.name}
            className="tutor-card__avatar"
            onError={handleImageError}
            loading="lazy"
          />
          {tutor.rating && parseFloat(tutor.rating) > 0 && (
            <div className="tutor-card__rating">
              <FaStar /> {parseFloat(tutor.rating).toFixed(1)}
            </div>
          )}
        </div>

        {/* Teaching Mode Badges */}
        <div className="tutor-card__modes">
          {hasOnlineMode && (
            <span className="tutor-card__mode tutor-card__mode--online">
              <FaVideo /> Online
            </span>
          )}
          {hasOfflineMode && (
            <span className="tutor-card__mode tutor-card__mode--offline">
              <FaUsers /> In-Person
            </span>
          )}
        </div>

        {/* Reviews */}
        <div className="tutor-card__reviews">
          {tutor.rating ? (
            <span>{tutor.reviews || 0} reviews</span>
          ) : (
            <span className="tutor-card__no-reviews">New Tutor</span>
          )}
        </div>
      </div>

      {/* Right Section - Details */}
      <div className="tutor-card__content">
        <div className="tutor-card__header">
          <div className="tutor-card__title-row">
            <h3 className="tutor-card__name">{tutor.name}</h3>
            {parseFloat(tutor.rating) >= 4.5 && (
              <span className="tutor-card__verified">
                <FaCheckCircle /> Top Rated
              </span>
            )}
          </div>
          <p className="tutor-card__specialization">{tutor.specialization}</p>
        </div>

        {/* Quick Stats */}
        <div className="tutor-card__stats">
          {tutor.qualification && (
            <div className="tutor-card__stat">
              <FaGraduationCap />
              <span>{tutor.qualification}</span>
            </div>
          )}
          {tutor.experience && (
            <div className="tutor-card__stat">
              <FaClock />
              <span>{tutor.experience} years experience</span>
            </div>
          )}
          {tutor.location?.city && (
            <div className="tutor-card__stat">
              <FaMapMarkerAlt />
              <span>
                {tutor.location.city}
                {tutor.location.state ? `, ${tutor.location.state}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="tutor-card__subjects">
            {subjects.map((subject, idx) => (
              <span key={idx} className="tutor-card__subject">
                {subject}
              </span>
            ))}
            {tutor.subjects && tutor.subjects.length > 3 && (
              <span className="tutor-card__subject tutor-card__subject--more">
                +{tutor.subjects.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bio - shown in expanded view */}
        {expanded && tutor.bio && (
          <p className="tutor-card__bio">
            {tutor.bio.length > 150
              ? `${tutor.bio.substring(0, 150)}...`
              : tutor.bio}
          </p>
        )}

        {/* Footer - Price & Actions */}
        <div className="tutor-card__footer">
          {hasOnlineMode && (
            <div className="tutor-card__price">
              <span className="tutor-card__price-amount">
                ₹{tutor.hourlyRate || 500}
              </span>
              <span className="tutor-card__price-unit">/hour</span>
            </div>
          )}

          <div className="tutor-card__actions">
            <Link
              to={`/tutors/${tutor.id}`}
              className="tutor-card__btn tutor-card__btn--outline"
            >
              View Profile
            </Link>
            {hasOnlineMode && (
              <button
                onClick={handleBookSession}
                className="tutor-card__btn tutor-card__btn--primary"
              >
                Book Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
