const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const emailService = require("../services/email.service");

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      pendingVerifications,
      approvedTutors,
      rejectedTutors,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tutor" }),
      User.countDocuments({ role: "student" }),
      Tutor.countDocuments({ verificationStatus: "pending" }),
      Tutor.countDocuments({ verificationStatus: "approved" }),
      Tutor.countDocuments({ verificationStatus: "rejected" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTutors,
        totalStudents,
        pendingVerifications,
        approvedTutors,
        rejectedTutors,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
};

/**
 * Get list of tutors pending verification
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "pending" } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.verificationStatus = status;
    }

    const tutors = await Tutor.find(query)
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Tutor.countDocuments(query);

    res.json({
      success: true,
      tutors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending verifications",
    });
  }
};

/**
 * Get tutor details for verification review
 */
exports.getTutorForVerification = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutor = await Tutor.findById(tutorId).populate(
      "user",
      "firstName lastName email phoneNumber profileImage gender createdAt"
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Get verification history if exists
    const verificationHistory = tutor.verificationHistory || [];

    res.json({
      success: true,
      tutor: {
        _id: tutor._id,
        user: tutor.user,
        qualification: tutor.qualification,
        experience: tutor.experience,
        specialization: tutor.specialization,
        universityName: tutor.universityName,
        graduationYear: tutor.graduationYear,
        bio: tutor.bio,
        subjects: tutor.subjects,
        teachingMode: tutor.teachingMode,
        hourlyRate: tutor.hourlyRate,
        // Documents
        idDocument: tutor.idDocument,
        qualificationDocument: tutor.qualificationDocument,
        markSheet: tutor.markSheet,
        experienceCertificate: tutor.experienceCertificate,
        additionalCertificates: tutor.additionalCertificates,
        // Verification info
        verificationStatus: tutor.verificationStatus,
        verificationNotes: tutor.verificationNotes,
        verifiedAt: tutor.verifiedAt,
        verificationHistory,
        createdAt: tutor.createdAt,
        updatedAt: tutor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching tutor for verification:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tutor details",
    });
  }
};

/**
 * Approve tutor verification
 */
exports.approveTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const tutor = await Tutor.findById(tutorId).populate(
      "user",
      "firstName lastName email"
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Update verification status
    tutor.verificationStatus = "approved";
    tutor.verificationNotes =
      notes || "Your profile has been verified successfully!";
    tutor.verifiedAt = new Date();
    tutor.verifiedBy = adminId;
    tutor.isProfileComplete = true;

    // Add to verification history
    if (!tutor.verificationHistory) {
      tutor.verificationHistory = [];
    }
    tutor.verificationHistory.push({
      status: "approved",
      notes: notes || "Profile verified",
      timestamp: new Date(),
      adminId,
    });

    await tutor.save();

    // Send approval email to tutor
    try {
      await emailService.sendVerificationApprovalEmail(
        tutor.user.email,
        `${tutor.user.firstName} ${tutor.user.lastName}`,
        notes
      );
    } catch (emailError) {
      console.warn("Failed to send approval email:", emailError);
    }

    res.json({
      success: true,
      message: "Tutor approved successfully",
      tutor: {
        _id: tutor._id,
        verificationStatus: tutor.verificationStatus,
        verifiedAt: tutor.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Error approving tutor:", error);
    res.status(500).json({
      success: false,
      message: "Error approving tutor",
    });
  }
};

/**
 * Reject tutor verification
 */
exports.rejectTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { reason, notes } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const tutor = await Tutor.findById(tutorId).populate(
      "user",
      "firstName lastName email"
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Update verification status
    tutor.verificationStatus = "rejected";
    tutor.verificationNotes = `Reason: ${reason}${
      notes ? `. Additional notes: ${notes}` : ""
    }`;
    tutor.verifiedAt = new Date();
    tutor.verifiedBy = adminId;

    // Add to verification history
    if (!tutor.verificationHistory) {
      tutor.verificationHistory = [];
    }
    tutor.verificationHistory.push({
      status: "rejected",
      reason,
      notes,
      timestamp: new Date(),
      adminId,
    });

    await tutor.save();

    // Send rejection email to tutor
    try {
      await emailService.sendVerificationRejectionEmail(
        tutor.user.email,
        `${tutor.user.firstName} ${tutor.user.lastName}`,
        reason,
        notes
      );
    } catch (emailError) {
      console.warn("Failed to send rejection email:", emailError);
    }

    res.json({
      success: true,
      message: "Tutor verification rejected",
      tutor: {
        _id: tutor._id,
        verificationStatus: tutor.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error rejecting tutor:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting tutor",
    });
  }
};

/**
 * Request additional information from tutor
 */
exports.requestMoreInfo = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { message, requiredDocuments } = req.body;
    const adminId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const tutor = await Tutor.findById(tutorId).populate(
      "user",
      "firstName lastName email"
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Update verification status to needs_info
    tutor.verificationStatus = "needs_info";
    tutor.verificationNotes = message;

    // Add to verification history
    if (!tutor.verificationHistory) {
      tutor.verificationHistory = [];
    }
    tutor.verificationHistory.push({
      status: "needs_info",
      message,
      requiredDocuments,
      timestamp: new Date(),
      adminId,
    });

    await tutor.save();

    // Send email to tutor requesting more info
    try {
      await emailService.sendVerificationInfoRequestEmail(
        tutor.user.email,
        `${tutor.user.firstName} ${tutor.user.lastName}`,
        message,
        requiredDocuments
      );
    } catch (emailError) {
      console.warn("Failed to send info request email:", emailError);
    }

    res.json({
      success: true,
      message: "Information request sent to tutor",
      tutor: {
        _id: tutor._id,
        verificationStatus: tutor.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error requesting more info:", error);
    res.status(500).json({
      success: false,
      message: "Error requesting more information",
    });
  }
};

/**
 * Get all users (admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};
