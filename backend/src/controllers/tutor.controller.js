const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");

// Get featured tutors for homepage
exports.getFeaturedTutors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    // Find verified tutors with their user information
    const tutors = await Tutor.find({ verificationStatus: "approved" })
      .populate({
        path: "user",
        select: "firstName lastName email profileImage",
      })
      .limit(limit)
      .lean();

    // Format the response
    const formattedTutors = tutors.map((tutor) => ({
      id: tutor._id,
      userId: tutor.user._id,
      name: `${tutor.user.firstName} ${tutor.user.lastName}`,
      email: tutor.user.email,
      specialization: tutor.specialization,
      qualification: tutor.qualification,
      experience: tutor.experience,
      university: tutor.universityName,
      rating: tutor.rating || null,
      reviews: tutor.totalReviews || 0,
      image: tutor.user.profileImage || "/images/tutors/tutor-placeholder.svg",
    }));

    res.status(200).json({
      success: true,
      tutors: formattedTutors,
    });
  } catch (error) {
    console.error("Error getting featured tutors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured tutors",
    });
  }
};

// Get all tutors with pagination and filtering
exports.getAllTutors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "rating"; // Default sort by rating
    const order = req.query.order === "asc" ? 1 : -1; // Default descending

    // Build filter object
    const filter = { verificationStatus: "approved" };

    // Teaching mode filter
    if (req.query.teachingMode) {
      const modes = Array.isArray(req.query.teachingMode)
        ? req.query.teachingMode
        : [req.query.teachingMode];

      // Handle special case for online/offline filtering
      if (modes.includes("online")) {
        filter.teachingMode = { $in: ["online_individual", "online_group"] };
      } else if (modes.includes("offline")) {
        filter.teachingMode = { $in: ["offline_home", "offline_classroom"] };
      } else {
        filter.teachingMode = { $in: modes };
      }
    }

    // Subjects/Specialization filter (using partial text matching)
    if (req.query.subjects) {
      filter.specialization = new RegExp(req.query.subjects, "i");
    }

    // Location filter for offline tutoring
    if (req.query.location) {
      filter["location.city"] = new RegExp(req.query.location, "i");
    }

    // Experience filter (minimum years)
    if (req.query.minExperience) {
      // Note: This assumes experience is stored as a number in years
      // If experience is stored as a string, you'd need to convert/parse it
      filter.experience = { $gte: req.query.minExperience };
    }

    // Price/Hourly rate range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.hourlyRate = {};
      if (req.query.minPrice)
        filter.hourlyRate.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice)
        filter.hourlyRate.$lte = parseInt(req.query.maxPrice);
    }

    // Rating filter (minimum rating)
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Availability filter
    if (req.query.day) {
      filter["availability.day"] = req.query.day;
    }

    // Create the sort option
    const sortOption = {};
    sortOption[sort] = order;

    // Execute the query with filters
    const tutors = await Tutor.find(filter)
      .populate({
        path: "user",
        select: "firstName lastName email profileImage",
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total filtered tutors
    const totalTutors = await Tutor.countDocuments(filter);

    const formattedTutors = tutors.map((tutor) => ({
      id: tutor._id,
      userId: tutor.user._id,
      name: `${tutor.user.firstName} ${tutor.user.lastName}`,
      email: tutor.user.email,
      specialization: tutor.specialization,
      qualification: tutor.qualification,
      experience: tutor.experience,
      university: tutor.universityName,
      teachingMode: tutor.teachingMode || ["online"],
      location: tutor.location || {},
      hourlyRate: tutor.hourlyRate || 0,
      availability: tutor.availability || [],
      rating: tutor.rating || null,
      reviews: tutor.totalReviews || 0,
      image: tutor.user.profileImage || "/images/tutors/tutor-placeholder.svg",
    }));

    res.status(200).json({
      success: true,
      tutors: formattedTutors,
      pagination: {
        page,
        limit,
        totalTutors,
        totalPages: Math.ceil(totalTutors / limit),
        hasMore: page * limit < totalTutors,
      },
    });
  } catch (error) {
    console.error("Error getting all tutors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tutors",
      error: error.message,
    });
  }
};

// Get tutor by ID
exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate({
        path: "user",
        select: "firstName lastName email profileImage",
      })
      .lean();

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Check if tutor is verified
    if (tutor.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "This tutor profile is not currently available",
      });
    }

    const formattedTutor = {
      id: tutor._id,
      userId: tutor.user._id,
      name: `${tutor.user.firstName} ${tutor.user.lastName}`,
      email: tutor.user.email,
      specialization: tutor.specialization,
      qualification: tutor.qualification,
      experience: tutor.experience,
      university: tutor.universityName,
      graduationYear: tutor.graduationYear,
      bio: tutor.bio || "",
      subjects: tutor.subjects || [],
      availability: tutor.availability || [],
      teachingMode: tutor.teachingMode || ["online_individual"],
      hourlyRate: tutor.hourlyRate || 0,
      location: tutor.location || { city: "", state: "", country: "" },
      rating: tutor.rating || null,
      reviews: tutor.totalReviews || 0,
      image: tutor.user.profileImage || "/images/tutors/tutor-placeholder.svg",
    };

    res.status(200).json({
      success: true,
      tutor: formattedTutor,
    });
  } catch (error) {
    console.error("Error getting tutor by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tutor",
    });
  }
};

// Get tutor profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find tutor with their user information
    const tutor = await Tutor.findOne({ user: userId })
      .populate({
        path: "user",
        select: "firstName lastName email profileImage phoneNumber",
      })
      .lean();

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Format the response
    const formattedTutor = {
      id: tutor._id,
      userId: tutor.user._id,
      name: `${tutor.user.firstName} ${tutor.user.lastName}`,
      firstName: tutor.user.firstName,
      lastName: tutor.user.lastName,
      email: tutor.user.email,
      phoneNumber: tutor.user.phoneNumber,
      profileImage: tutor.user.profileImage,
      bio: tutor.bio,
      specialization: tutor.specialization,
      qualification: tutor.qualification,
      experience: tutor.experience,
      universityName: tutor.universityName,
      graduationYear: tutor.graduationYear,
      teachingMode: tutor.teachingMode,
      subjects: tutor.subjects || [],
      preferredClasses: tutor.preferredClasses || [],
      location: tutor.location || { city: "", state: "", country: "" },
      hourlyRate: tutor.hourlyRate || 0,
      availability: tutor.availability || [],
      certifications: tutor.certifications || [],
      verificationStatus: tutor.verificationStatus,
      // Include document information to show if they were previously uploaded
      hasIdDocument: !!tutor.idDocument,
      hasQualificationDocument: !!tutor.qualificationDocument,
    };

    // Combine all data into tutor object
    formattedTutor.user = {
      firstName: tutor.user.firstName,
      lastName: tutor.user.lastName,
      email: tutor.user.email,
      phoneNumber: tutor.user.phoneNumber,
      profileImage: tutor.user.profileImage,
    };

    res.status(200).json({
      success: true,
      tutor: formattedTutor,
    });
  } catch (error) {
    console.error("Error getting tutor profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tutor profile",
    });
  }
};

// Update profile with full details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if the user is a tutor
    const user = await User.findById(userId);
    if (!user || user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can access this resource",
      });
    }

    // Find the tutor profile
    let tutor = await Tutor.findOne({ user: userId });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Extract fields from the request body
    const {
      bio,
      teachingMode,
      subjects,
      preferredClasses,
      location,
      hourlyRate,
      qualification,
      universityName,
      experience,
      graduationYear,
      specialization,
      certifications,
      availability,
    } = req.body;

    // Update tutor profile with proper type handling
    tutor.bio = bio || tutor.bio;
    tutor.qualification = qualification || tutor.qualification;
    tutor.experience = experience || tutor.experience;
    tutor.specialization = specialization || tutor.specialization;
    tutor.universityName = universityName || tutor.universityName;
    tutor.graduationYear = graduationYear || tutor.graduationYear;
    tutor.hourlyRate = hourlyRate || tutor.hourlyRate;

    // Handle teachingMode - could be string (FormData) or object (JSON)
    if (teachingMode) {
      try {
        tutor.teachingMode =
          typeof teachingMode === "string"
            ? JSON.parse(teachingMode)
            : teachingMode;
      } catch (e) {
        console.error("Error parsing teachingMode:", e);
        tutor.teachingMode = teachingMode; // Use as-is if parsing fails
      }
    }

    // Handle subjects field - could be string (FormData) or array (JSON)
    if (subjects) {
      try {
        tutor.subjects =
          typeof subjects === "string" ? JSON.parse(subjects) : subjects;
      } catch (e) {
        console.error("Error parsing subjects:", e);
        tutor.subjects = Array.isArray(subjects) ? subjects : [subjects];
      }
    }

    // Handle location - could be string (FormData) or object (JSON)
    if (location) {
      try {
        tutor.location =
          typeof location === "string" ? JSON.parse(location) : location;
      } catch (e) {
        console.error("Error parsing location:", e);
        tutor.location = location; // Use as-is if parsing fails
      }
    }

    // Handle availability - could be string (FormData) or object (JSON)
    if (availability) {
      try {
        tutor.availability =
          typeof availability === "string"
            ? JSON.parse(availability)
            : availability;
      } catch (e) {
        console.error("Error parsing availability:", e);
        tutor.availability = availability; // Use as-is if parsing fails
      }
    }

    if (certifications) {
      tutor.certifications = JSON.parse(certifications);
    }

    // Handle file uploads
    if (req.files) {
      // These are only updated in profile setup if user wants to update them
      if (req.files.idDocument) {
        tutor.idDocument = req.files.idDocument[0].path.replace(/\\/g, "/");
      }

      if (req.files.qualificationDocument) {
        tutor.qualificationDocument =
          req.files.qualificationDocument[0].path.replace(/\\/g, "/");
      }

      // New document types for profile setup
      if (req.files.markSheet) {
        tutor.markSheet = req.files.markSheet[0].path.replace(/\\/g, "/");
      }

      if (req.files.experienceCertificate) {
        tutor.experienceCertificate =
          req.files.experienceCertificate[0].path.replace(/\\/g, "/");
      }

      if (req.files.additionalCertificates) {
        tutor.additionalCertificates =
          req.files.additionalCertificates[0].path.replace(/\\/g, "/");
      }

      if (req.files.profileImage) {
        // Normalize path to use forward slashes
        user.profileImage = req.files.profileImage[0].path.replace(/\\/g, "/");
        await user.save();
      }
    }

    // Set the verification status to pending if it was not already approved
    if (tutor.verificationStatus !== "approved") {
      tutor.verificationStatus = "pending";
    }

    // Save the tutor
    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      tutor: {
        bio: tutor.bio,
        teachingMode: tutor.teachingMode,
        qualification: tutor.qualification,
        experience: tutor.experience,
        specialization: tutor.specialization,
        universityName: tutor.universityName,
        graduationYear: tutor.graduationYear,
        hourlyRate: tutor.hourlyRate,
        location: tutor.location,
        availability: tutor.availability,
        verificationStatus: tutor.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// Get verification status
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the tutor profile
    const tutor = await Tutor.findOne({ user: userId });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      status: tutor.verificationStatus,
      message: getVerificationMessage(tutor.verificationStatus),
    });
  } catch (error) {
    console.error("Error getting verification status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verification status",
    });
  }
};

// Helper function to get verification message
function getVerificationMessage(status) {
  switch (status) {
    case "pending":
      return "Your account is pending verification. We'll notify you once approved.";
    case "approved":
      return "Your account has been verified. You can now start accepting students.";
    case "rejected":
      return "Your verification was not approved. Please contact support for more information.";
    default:
      return "Verification status unknown.";
  }
}

// Get tutor sessions
exports.getTutorSessions = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const statusQuery = req.query.status || "upcoming"; // Default to upcoming sessions

    // Find the tutor record
    const tutor = await Tutor.findOne({ user: tutorId });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Import the Session model
    const Session = require("../models/session.model");
    const Student = require("../models/student.model");
    const User = require("../models/user.model");

    // Build query based on status parameter
    let query = { tutor: tutor._id };
    const now = new Date();

    if (statusQuery === "upcoming") {
      query.startTime = { $gte: now };
      query.status = { $in: ["scheduled", "rescheduled"] };
    } else if (statusQuery === "past") {
      query.endTime = { $lt: now };
      query.status = { $in: ["completed"] };
    } else if (statusQuery === "cancelled") {
      query.status = "cancelled";
    } else {
      // if status is "all" or any other value, don't filter by status
    }

    // Query real sessions from the database
    const sessions = await Session.find(query)
      .sort({ startTime: 1 })
      .populate({
        path: "student",
        select: "user",
        populate: {
          path: "user",
          select: "firstName lastName profileImage",
        },
      })
      .lean();

    console.log(`[DEBUG] Tutor sessions query:`, {
      query,
      foundSessions: sessions.length,
      sessionIds: sessions.map((s) => s._id.toString()),
      statusFilter: query.status,
    });

    // Format the response
    const formattedSessions = sessions.map((session) => {
      const studentInfo =
        session.student && session.student.user
          ? {
              id: session.student._id,
              name:
                session.student.user.firstName && session.student.user.lastName
                  ? `${session.student.user.firstName} ${session.student.user.lastName}`
                  : "Student",
              profileImage: session.student.user.profileImage || null,
            }
          : {
              id: "unknown",
              name: "Unknown Student",
              profileImage: null,
            };

      return {
        id: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        student: studentInfo,
        mode: session.mode,
        subject: session.subject,
        status: session.status,
        meetingLink: session.meetingLink || null,
      };
    });

    // Return the real session data
    res.status(200).json({
      success: true,
      sessions: formattedSessions,
      message: `${
        statusQuery.charAt(0).toUpperCase() + statusQuery.slice(1)
      } sessions retrieved successfully`,
    });
  } catch (error) {
    console.error("Error fetching tutor sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor sessions",
      error: error.message,
    });
  }
};

// Get tutor dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const tutorId = req.user.tutorId;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID not found",
      });
    }

    // Import models for statistics
    const Session = require("../models/session.model");
    const SessionRequest = require("../models/sessionRequest.model");

    // Get session statistics
    const [totalSessions, completedSessions, upcomingSessions] =
      await Promise.all([
        Session.countDocuments({ tutor: tutorId }),
        Session.countDocuments({ tutor: tutorId, status: "completed" }),
        Session.countDocuments({
          tutor: tutorId,
          status: { $in: ["confirmed", "scheduled"] },
          date: { $gte: new Date() },
        }),
      ]);

    // Get total hours taught from completed sessions
    const completedSessionsWithDuration = await Session.find({
      tutor: tutorId,
      status: "completed",
    }).select("duration");

    const totalHours = completedSessionsWithDuration.reduce((sum, session) => {
      return sum + (session.duration || 0);
    }, 0);

    // Get unique students count
    const uniqueStudents = await Session.distinct("student", {
      tutor: tutorId,
    });
    const totalStudents = uniqueStudents.length;

    // Get pending session requests
    const pendingRequests = await SessionRequest.countDocuments({
      tutor: tutorId,
      status: "pending",
    });

    // Get tutor rating
    const tutor = await Tutor.findById(tutorId).select("rating");
    const averageRating = tutor?.rating || 0;

    const dashboardStats = {
      totalSessions,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      totalStudents,
      completedSessions,
      upcomingSessions,
      pendingRequests,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    };

    res.status(200).json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error("Error fetching tutor dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
    });
  }
};

// Get tutor notification count
exports.getNotificationCount = async (req, res) => {
  try {
    const tutorId = req.user.tutorId;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID not found",
      });
    }

    // For now, return a mock count
    // This can be enhanced with actual notification model
    const count = 0;

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notification count",
      error: error.message,
    });
  }
};

// Get pending session requests count
exports.getPendingRequestsCount = async (req, res) => {
  try {
    const tutorId = req.user.tutorId;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID not found",
      });
    }

    const SessionRequest = require("../models/sessionRequest.model");

    const count = await SessionRequest.countDocuments({
      tutor: tutorId,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error fetching pending requests count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pending requests count",
      error: error.message,
    });
  }
};
