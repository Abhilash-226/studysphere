import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import tutorService from "../../services/tutor.service";
import { formatImageUrl } from "../../utils/imageUtils";
import "./TutorsSection.css";

const TutorsSection = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                <div className="tutor-image">
                  <img
                    src={formatImageUrl(tutor.image)}
                    alt={tutor.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/tutors/tutor-placeholder.svg";
                    }}
                  />
                </div>
                <div className="tutor-info">
                  <h3>{tutor.name}</h3>
                  <p className="tutor-specialization">{tutor.specialization}</p>
                  <div className="tutor-rating">
                    <span className="rating-number">{tutor.rating}</span>
                    <div className="stars">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          className={`star ${
                            index < Math.floor(tutor.rating) ? "filled" : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="tutor-actions">
                  <Link to={`/tutors/${tutor.id}`} className="btn btn-primary">
                    View Profile
                  </Link>
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
