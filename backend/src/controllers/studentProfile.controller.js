const Student = require("../models/student.model");
const User = require("../models/user.model");
const Session = require("../models/session.model");

/**
 * Get student profile by ID (for tutors)
 */
exports.getStudentProfileById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorUserId = req.user.id;

    // Find the student profile
    const student = await Student.findById(studentId)
      .populate({
        path: "user",
        select: "firstName lastName email profileImage gender createdAt",
      })
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Verify that the tutor has permission to view this student's profile
    // Check if tutor has had sessions with this student
    const Tutor = require("../models/tutor.model");
    const tutor = await Tutor.findOne({ user: tutorUserId });

    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Tutor profile not found.",
      });
    }

    const hasSessionWithStudent = await Session.findOne({
      tutor: tutor._id,
      student: studentId,
    });

    if (!hasSessionWithStudent) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view profiles of students you teach.",
      });
    }

    // Get session history with this student
    const sessionHistory = await Session.find({
      tutor: tutor._id,
      student: studentId,
    })
      .select("title subject startTime endTime status notes")
      .sort({ startTime: -1 })
      .limit(10)
      .lean();

    // Format the response
    const studentProfile = {
      id: student._id,
      user: student.user,
      personalInfo: {
        grade: student.grade,
        academicLevel: student.academicLevel,
        school: student.school,
        currentGPA: student.currentGPA,
        bio: student.bio,
        interests: student.interests || [],
      },
      academicInfo: {
        subjects: student.subjects || [],
        academicGoals: student.academicGoals || [],
        strengths: student.strengths || [],
        areasForImprovement: student.areasForImprovement || [],
      },
      learningPreferences: {
        learningStyle: student.learningStyle || [],
        studySchedulePreference: student.studySchedulePreference,
        homeworkHelpNeeds: student.homeworkHelpNeeds || [],
        examPreparationNeeds: student.examPreparationNeeds || [],
        preferredTeachingMode: student.preferredTeachingMode || [],
      },
      background: {
        previousTutoringExperience: student.previousTutoringExperience,
        tutoringExperienceDetails: student.tutoringExperienceDetails,
        specialLearningNeeds: student.specialLearningNeeds,
        availableStudyTime: student.availableStudyTime,
      },
      parentInfo: {
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        parentInvolvement: student.parentInvolvement,
      },
      location: student.location,
      metadata: {
        profileCompleteness: student.profileCompleteness,
        memberSince: student.user.createdAt,
        lastUpdated: student.updatedAt,
      },
      sessionHistory,
    };

    res.status(200).json({
      success: true,
      student: studentProfile,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student profile",
      error: error.message,
    });
  }
};

/**
 * Get current student's own profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ user: userId })
      .populate({
        path: "user",
        select: "firstName lastName email profileImage gender",
      })
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

/**
 * Update student profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Extract gender from updateData for User model update
    const { gender, ...studentData } = updateData;

    // Remove fields that shouldn't be updated directly
    delete studentData.user;
    delete studentData._id;
    delete studentData.profileCompleteness;
    delete studentData.createdAt;
    delete studentData.updatedAt;

    // Update gender in User model if provided
    if (gender !== undefined) {
      await User.findByIdAndUpdate(userId, { gender }, { runValidators: true });
    }

    // Update student profile
    const student = await Student.findOneAndUpdate(
      { user: userId },
      studentData,
      { new: true, runValidators: true }
    ).populate({
      path: "user",
      select: "firstName lastName email profileImage gender",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * Get students taught by a tutor (for tutor dashboard)
 */
exports.getMyStudents = async (req, res) => {
  try {
    const tutorUserId = req.user.id;

    const Tutor = require("../models/tutor.model");
    const tutor = await Tutor.findOne({ user: tutorUserId });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Get unique students from sessions
    const sessions = await Session.find({ tutor: tutor._id })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "firstName lastName profileImage",
        },
      })
      .lean();

    // Get unique students
    const uniqueStudents = new Map();
    sessions.forEach((session) => {
      if (session.student && session.student.user) {
        const studentId = session.student._id.toString();
        if (!uniqueStudents.has(studentId)) {
          uniqueStudents.set(studentId, {
            id: session.student._id,
            name: `${session.student.user.firstName} ${session.student.user.lastName}`,
            profileImage: session.student.user.profileImage,
            grade: session.student.grade,
            school: session.student.school,
            subjects: session.student.subjects || [],
            profileCompleteness: session.student.profileCompleteness || 0,
            lastSession: session.startTime,
          });
        } else {
          // Update last session if this one is more recent
          const existing = uniqueStudents.get(studentId);
          if (new Date(session.startTime) > new Date(existing.lastSession)) {
            existing.lastSession = session.startTime;
          }
        }
      }
    });

    const students = Array.from(uniqueStudents.values()).sort(
      (a, b) => new Date(b.lastSession) - new Date(a.lastSession)
    );

    res.status(200).json({
      success: true,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error("Error fetching tutor's students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
};

/**
 * Get student profile summary (for session cards)
 */
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorUserId = req.user.id;

    // Verify tutor permission
    const Tutor = require("../models/tutor.model");
    const tutor = await Tutor.findOne({ user: tutorUserId });

    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Tutor profile not found.",
      });
    }

    const hasPermission = await Session.findOne({
      tutor: tutor._id,
      student: studentId,
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const student = await Student.findById(studentId)
      .populate({
        path: "user",
        select: "firstName lastName profileImage",
      })
      .select(
        "grade school subjects learningStyle strengths areasForImprovement profileCompleteness"
      )
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const summary = {
      id: student._id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      profileImage: student.user.profileImage,
      grade: student.grade,
      school: student.school,
      subjects: student.subjects || [],
      learningStyle: student.learningStyle || [],
      strengths: student.strengths || [],
      areasForImprovement: student.areasForImprovement || [],
      profileCompleteness: student.profileCompleteness || 0,
    };

    res.status(200).json({
      success: true,
      student: summary,
    });
  } catch (error) {
    console.error("Error fetching student summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student summary",
      error: error.message,
    });
  }
};
