import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TutorFilters from "../../components/TutorFilters";
import TutorCard from "../../components/TutorCard";
import tutorService from "../../../shared/services/tutor.service";
import "./TutorsPage.css";

const TutorsPage = ({ teachingMode }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    teachingModes: [
      { value: "online", label: "All Online Options" },
      { value: "offline", label: "All In-Person Options" },
      { value: "online_individual", label: "Online (Individual)" },
      { value: "online_group", label: "Online (Group)" },
      { value: "offline_home", label: "In-Person (Student's Home)" },
      { value: "offline_classroom", label: "In-Person (Tutor's Classroom)" },
    ],
    subjects: [
      { value: "Mathematics", label: "Mathematics", count: 0 },
      { value: "Physics", label: "Physics", count: 0 },
      { value: "Chemistry", label: "Chemistry", count: 0 },
      { value: "Biology", label: "Biology", count: 0 },
      { value: "Computer Science", label: "Computer Science", count: 0 },
      { value: "Literature", label: "Literature", count: 0 },
      { value: "History", label: "History", count: 0 },
      { value: "Geography", label: "Geography", count: 0 },
      { value: "Economics", label: "Economics", count: 0 },
      { value: "Languages", label: "Languages", count: 0 },
    ],
    locations: [],
    availability: [
      { value: "Monday", label: "Monday" },
      { value: "Tuesday", label: "Tuesday" },
      { value: "Wednesday", label: "Wednesday" },
      { value: "Thursday", label: "Thursday" },
      { value: "Friday", label: "Friday" },
      { value: "Saturday", label: "Saturday" },
      { value: "Sunday", label: "Sunday" },
    ],
    ratingCounts: { 2: 0, 3: 0, 4: 0 },
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalTutors: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [sortOption, setSortOption] = useState({
    sort: "rating",
    order: "desc",
  });

  // Fetch tutors with filters
  const fetchTutors = async (newFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Convert UI filters to API filters
      const apiFilters = {
        teachingMode: newFilters.teachingMode
          ? [newFilters.teachingMode]
          : undefined,
        gender: newFilters.gender || undefined,
        subjects: newFilters.subjects
          ? newFilters.subjects.join(",")
          : undefined,
        location:
          newFilters.locations && newFilters.locations.length > 0
            ? newFilters.locations[0] // Just use the first location for now
            : undefined,
        minExperience: newFilters.experience
          ? newFilters.experience[0]
          : undefined,
        minPrice: newFilters.price ? newFilters.price[0] : undefined,
        maxPrice: newFilters.price ? newFilters.price[1] : undefined,
        minRating:
          newFilters.rating && newFilters.rating.length > 0
            ? Math.min(...newFilters.rating)
            : undefined,
        day:
          newFilters.availability && newFilters.availability.length > 0
            ? newFilters.availability[0] // Just use the first availability for now
            : undefined,
      };

      const response = await tutorService.getAllTutors(
        pagination.page,
        pagination.limit,
        apiFilters,
        sortOption.sort,
        sortOption.order
      );

      if (response && response.success && response.tutors) {
        setTutors(response.tutors);
        setPagination(response.pagination || pagination);

        // Collect count data for filter options
        const subjectCountMap = {};
        const genderCountMap = {};
        const locationSet = new Set();
        const ratingCounts = { 2: 0, 3: 0, 4: 0 };

        response.tutors.forEach((tutor) => {
          // For specialization (subject) - count specialization (case-insensitive)
          if (tutor.specialization) {
            const normalizedSpec = tutor.specialization.toLowerCase();
            if (!subjectCountMap[normalizedSpec]) {
              subjectCountMap[normalizedSpec] = 0;
            }
            subjectCountMap[normalizedSpec]++;
          }

          // For subjects array - count all subjects taught by the tutor (case-insensitive)
          if (tutor.subjects && Array.isArray(tutor.subjects)) {
            tutor.subjects.forEach((subject) => {
              const normalizedSubject = subject.toLowerCase();
              if (!subjectCountMap[normalizedSubject]) {
                subjectCountMap[normalizedSubject] = 0;
              }
              subjectCountMap[normalizedSubject]++;
            });
          }

          // For gender
          if (tutor.gender) {
            if (!genderCountMap[tutor.gender]) {
              genderCountMap[tutor.gender] = 0;
            }
            genderCountMap[tutor.gender]++;
          }

          // For location
          if (tutor.location && tutor.location.city) {
            locationSet.add(tutor.location.city);
          }

          // Count ratings
          const rating = parseFloat(tutor.rating);
          if (rating >= 4) ratingCounts["4"]++;
          if (rating >= 3) ratingCounts["3"]++;
          if (rating >= 2) ratingCounts["2"]++;
        });

        // Update filter options with counts from API data
        setFilterOptions((prev) => {
          const updatedSubjects = prev.subjects.map((subject) => ({
            ...subject,
            count: subjectCountMap[subject.value.toLowerCase()] || 0,
          }));

          const updatedGenders = [
            {
              value: "Male",
              label: "Male",
              count: genderCountMap["Male"] || 0,
            },
            {
              value: "Female",
              label: "Female",
              count: genderCountMap["Female"] || 0,
            },
            {
              value: "Other",
              label: "Other",
              count: genderCountMap["Other"] || 0,
            },
            {
              value: "Prefer not to say",
              label: "Prefer not to say",
              count: genderCountMap["Prefer not to say"] || 0,
            },
          ];

          const locations = Array.from(locationSet).map((city) => ({
            value: city,
            label: city,
            count: response.tutors.filter(
              (t) => t.location && t.location.city === city
            ).length,
          }));

          return {
            ...prev,
            subjects: updatedSubjects,
            genders: updatedGenders,
            locations,
            ratingCounts,
          };
        });
      } else {
        setError("Could not retrieve tutors at this time.");
      }
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setError("Failed to load tutors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch - apply teaching mode from props or URL
  useEffect(() => {
    // Determine teaching mode from props or URL path
    let initialTeachingMode = null;

    if (teachingMode === "online") {
      initialTeachingMode = "online"; // Use general online mode
    } else if (teachingMode === "offline") {
      initialTeachingMode = "offline"; // Use general offline mode
    } else if (location.pathname === "/online-tuition") {
      initialTeachingMode = "online";
    } else if (location.pathname === "/offline-tuition") {
      initialTeachingMode = "offline";
    }

    // Apply the teaching mode filter if it was determined
    if (initialTeachingMode) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        teachingMode: initialTeachingMode,
      }));
    } else {
      // If no teaching mode specified, just fetch with current filters
      fetchTutors(filters);
    }
  }, [location.pathname, teachingMode]);

  // Apply filters
  useEffect(() => {
    // Fetch tutors whenever filters or sort options change
    fetchTutors(filters);
    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    // Close mobile filters if they're open
    if (showMobileFilters) {
      setShowMobileFilters(false);
    }
  }, [filters, sortOption]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;

    switch (value) {
      case "relevance":
        setSortOption({ sort: "rating", order: "desc" });
        break;
      case "rating":
        setSortOption({ sort: "rating", order: "desc" });
        break;
      case "price_low":
        setSortOption({ sort: "hourlyRate", order: "asc" });
        break;
      case "price_high":
        setSortOption({ sort: "hourlyRate", order: "desc" });
        break;
      case "experience":
        setSortOption({ sort: "experience", order: "desc" });
        break;
      default:
        setSortOption({ sort: "rating", order: "desc" });
    }
  };

  const loadMoreTutors = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
      fetchTutors(filters);
    }
  };

  // Determine page title based on current mode
  const getPageTitle = () => {
    if (
      location.pathname === "/online-tuition" ||
      (filters.teachingMode && filters.teachingMode.includes("online"))
    ) {
      return "Online Tutors";
    } else if (
      location.pathname === "/offline-tuition" ||
      (filters.teachingMode &&
        (filters.teachingMode.includes("offline_home") ||
          filters.teachingMode.includes("offline_classroom")))
    ) {
      return "In-Person Tutors";
    }
    return "Find Your Perfect Tutor";
  };

  return (
    <div className="tutors-page">
      <div className="tutors-page-header">
        <h1>{getPageTitle()}</h1>
        <p>
          Browse through our qualified tutors and find the right match for your
          learning needs
        </p>

        {/* Mobile filter toggle button */}
        <button
          className="mobile-filter-toggle"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
          <span className="filter-icon">🔍</span>
        </button>
      </div>

      <div className="tutors-page-content">
        {/* Filters sidebar - desktop version always visible, mobile version toggleable */}
        <div
          className={`tutors-filters-container ${
            showMobileFilters ? "show-mobile" : ""
          }`}
        >
          <TutorFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            isMobile={false}
          />
        </div>

        {/* Tutors listing */}
        <div className="tutors-list-container">
          {loading && tutors.length === 0 ? (
            <div className="tutors-loading">
              <div className="spinner"></div>
              <p>Loading tutors...</p>
            </div>
          ) : error ? (
            <div className="tutors-error">
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={() => fetchTutors(filters)}
              >
                Try Again
              </button>
            </div>
          ) : tutors.length === 0 ? (
            <div className="no-tutors">
              <h3>No tutors match your filters</h3>
              <p>Try adjusting your filters to see more results</p>
              <button className="clear-button" onClick={() => setFilters({})}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="tutors-list-header">
                <p>
                  Showing {tutors.length} of {pagination.totalTutors}{" "}
                  {pagination.totalTutors === 1 ? "tutor" : "tutors"}
                </p>
                <select
                  className="sort-select"
                  value={`${
                    sortOption.sort === "hourlyRate"
                      ? sortOption.order === "asc"
                        ? "price_low"
                        : "price_high"
                      : sortOption.sort
                  }`}
                  onChange={handleSortChange}
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="rating">Sort by: Rating (High to Low)</option>
                  <option value="experience">
                    Sort by: Experience (High to Low)
                  </option>
                  <option value="price_low">
                    Sort by: Price (Low to High)
                  </option>
                  <option value="price_high">
                    Sort by: Price (High to Low)
                  </option>
                </select>
              </div>

              <div className="tutors-list">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} expanded={true} />
                ))}
              </div>

              {loading && (
                <div className="loading-more">
                  <div className="spinner"></div>
                  <p>Loading more tutors...</p>
                </div>
              )}

              {pagination.hasMore && !loading && (
                <div className="load-more-container">
                  <button className="load-more-button" onClick={loadMoreTutors}>
                    Load More Tutors
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorsPage;
