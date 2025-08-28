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

    // Update tutor profile
    tutor.bio = bio || tutor.bio;
    tutor.teachingMode = JSON.parse(teachingMode) || tutor.teachingMode;
    tutor.qualification = qualification || tutor.qualification;
    tutor.experience = experience || tutor.experience;
    tutor.specialization = specialization || tutor.specialization;
    tutor.universityName = universityName || tutor.universityName;
    tutor.graduationYear = graduationYear || tutor.graduationYear;
    tutor.hourlyRate = hourlyRate || tutor.hourlyRate;

    // Handle subjects field
    if (subjects) {
      tutor.subjects = JSON.parse(subjects);
    }

    // Handle more complex fields
    if (location) {
      tutor.location = JSON.parse(location);
    }

    if (availability) {
      tutor.availability = JSON.parse(availability);
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
