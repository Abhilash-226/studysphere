import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaVideo,
  FaMapMarkerAlt,
  FaGraduationCap,
} from "react-icons/fa";
import tutorService from "../../services/tutor.service";
import { formatImageUrl } from "../../utils/imageUtils";
import "./TutorsSection.css";

const TutorsSection = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if tutor offers online sessions
  const hasOnlineMode = (tutor) => {
    return (
      tutor.teachingMode &&
      (Array.isArray(tutor.teachingMode)
        ? tutor.teachingMode.some(
            (mode) => mode === "online" || mode.startsWith("online_")
          )
        : tutor.teachingMode === "online" ||
          tutor.teachingMode.startsWith("online_"))
    );
  };

  const handleBookSession = (e, tutor) => {
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
          teachingMode: tutor.teachingMode,
        },
      },
    });
  };

  // Fetch tutors from the API
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get featured tutors from the API
        const response = await tutorService.getFeaturedTutors(4);

        if (response && response.success && response.tutors) {
          setTutors(response.tutors);
        } else {
          // If no tutors or API response doesn't match expected format
          setError("Could not retrieve tutors at this time.");
        }
      } catch (err) {
        console.error("Error fetching tutors:", err);
        setError("Failed to load tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  return (
    <section className="tutors-section">
      <div className="container">
        <div className="section-header">
          <h2>Meet Our Top Tutors</h2>
          <p>Learn from the best minds in their fields</p>
        </div>

        {loading ? (
          <div className="tutors-loading">
            <div className="spinner"></div>
            <p>Loading tutors...</p>
          </div>
        ) : error ? (
          <div className="tutors-error">
            <p>{error}</p>
            <button
              className="btn btn-outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : tutors.length === 0 ? (
          <div className="tutors-empty">
            <p>No tutors available at the moment.</p>
          </div>
        ) : (
          <div className="tutors-grid">
            {tutors.map((tutor) => (
              <div className="tutor-card" key={tutor.id}>
                {/* Card Header with Avatar and Basic Info */}
                <div className="tutor-card__header">
                  <div className="tutor-card__avatar-container">
                    <img
                      src={formatImageUrl(tutor.image)}
                      alt={tutor.name}
                      className="tutor-card__avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/tutors/tutor-placeholder.svg";
                      }}
                    />
                    {tutor.rating && parseFloat(tutor.rating) > 0 && (
                      <div className="tutor-card__rating-badge">
                        <FaStar />
                        <span>{parseFloat(tutor.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="tutor-card__header-info">
                    <h3 className="tutor-card__name">{tutor.name}</h3>
                    <p className="tutor-card__specialization">
                      {tutor.specialization}
                    </p>
                    {hasOnlineMode(tutor) && (
                      <span className="tutor-card__online-badge">
                        <FaVideo /> Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="tutor-card__body">
                  {/* Quick Info */}
                  <div className="tutor-card__meta">
                    {tutor.experience && (
                      <span className="tutor-card__meta-item">
                        <FaGraduationCap /> {tutor.experience} yrs exp
                      </span>
                    )}
                    {tutor.location?.city && (
                      <span className="tutor-card__meta-item">
                        <FaMapMarkerAlt /> {tutor.location.city}
                      </span>
                    )}
                  </div>

                  {/* Subjects */}
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="tutor-card__subjects">
                      {tutor.subjects.slice(0, 3).map((subject, idx) => (
                        <span key={idx} className="tutor-card__subject-tag">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <span className="tutor-card__subject-tag tutor-card__subject-tag--more">
                          +{tutor.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price for online tutors */}
                  {hasOnlineMode(tutor) && (
                    <div className="tutor-card__price">
                      <span className="tutor-card__price-amount">
                        ₹{tutor.hourlyRate || 500}
                      </span>
                      <span className="tutor-card__price-unit">/hour</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="tutor-card__actions">
                  <Link
                    to={`/tutors/${tutor.id}`}
                    className="tutor-card__btn tutor-card__btn--primary"
                  >
                    View Profile
                  </Link>
                  {hasOnlineMode(tutor) && (
                    <button
                      onClick={(e) => handleBookSession(e, tutor)}
                      className="tutor-card__btn tutor-card__btn--secondary"
                    >
                      Book Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="see-all-tutors">
          <Link to="/tutors" className="btn btn-outline">
            Explore All Tutors <span className="arrow-icon">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TutorsSection;
