const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const studentProfileController = require("../controllers/studentProfile.controller");
const Student = require("../models/student.model");
const Session = require("../models/session.model");

const router = express.Router();

// GET student profile (protected - student only)
router.get(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const student = await Student.findOne({ user: userId }).populate(
        "user",
        "firstName lastName email phoneNumber profileImage"
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch student profile",
      });
    }
  }
);

// UPDATE student profile (protected - student only)
router.put(
  "/profile",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const student = await Student.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, runValidators: true }
      ).populate("user", "firstName lastName email phoneNumber profileImage");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: student,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating student profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update student profile",
      });
    }
  }
);

// GET student's sessions (protected - student only) - FIXED: Now queries actual database
router.get(
  "/sessions",
  authenticateToken,
  checkRole(["student", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.query;
      const userId = req.user.id;

      // Find student record
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      console.log(`[DEBUG] Student ID resolution:`, {
        userId: userId,
        userIdFromToken: req.user.id,
        studentRecordId: student._id.toString(),
        studentUserId: student.user.toString(),
      });

      // Build query filter
      let filter = { student: student._id };

      // Add status filter if provided
      if (status) {
        if (status === "upcoming") {
          filter.status = { $in: ["scheduled"] };
          filter.startTime = { $gte: new Date() };
        } else if (status === "completed") {
          filter.status = "completed";
        } else if (status === "cancelled") {
          filter.status = "cancelled";
        } else {
          filter.status = status;
        }
      }

      // Fetch sessions from database (not hardcoded data!)
      const sessions = await Session.find(filter)
        .populate({
          path: "tutor",
          populate: {
            path: "user",
            select: "firstName lastName profileImage",
          },
        })
        .sort({ startTime: 1 })
        .limit(50);

      console.log(`[DEBUG] Student sessions query:`, {
        filter,
        foundSessions: sessions.length,
        sessionIds: sessions.map((s) => s._id.toString()),
        statusFilter: filter.status,
      });

      // Also check if there are any sessions for this user ID directly (debugging data issue)
      const sessionsWithUserId = await Session.find({ student: userId }).limit(
        5
      );
      console.log(`[DEBUG] Sessions found with userId as student:`, {
        userId: userId.toString(),
        foundWithUserId: sessionsWithUserId.length,
        sessionIds: sessionsWithUserId.map((s) => s._id.toString()),
      });

      // Transform the data for frontend
      const transformedSessions = sessions.map((session) => ({
        _id: session._id,
        id: session._id, // Include both for compatibility
        title: session.title,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        mode: session.mode || "online",
        meetingUrl: session.meetingUrl,
        location: session.location,
        sessionType: session.sessionType,
        // Include class active status for showing Join button
        isClassActive: session.meetingRoom?.isActive || false,
        tutor: session.tutor
          ? {
              _id: session.tutor._id,
              name: session.tutor.user
                ? `${session.tutor.user.firstName} ${session.tutor.user.lastName}`
                : "Unknown Tutor",
              profileImage:
                session.tutor.user?.profileImage ||
                "/images/tutors/tutor-placeholder.svg",
              rating: session.tutor.averageRating || 0,
              subject: session.subject,
            }
          : null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));

      res.status(200).json({
        success: true,
        data: transformedSessions,
        count: transformedSessions.length,
      });
    } catch (error) {
      console.error("Error fetching student sessions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sessions",
      });
    }
  }
);

// GET student's favorite tutors (protected - student only)
router.get(
  "/favorites",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Get favorite tutors - Not implemented yet" });
  }
);

// ADD tutor to favorites (protected - student only)
router.post(
  "/favorites/:tutorId",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res.status(501).json({ message: "Add to favorites - Not implemented yet" });
  }
);

// REMOVE tutor from favorites (protected - student only)
router.delete(
  "/favorites/:tutorId",
  authenticateToken,
  checkRole(["student"]),
  (req, res) => {
    res
      .status(501)
      .json({ message: "Remove from favorites - Not implemented yet" });
  }
);

// GET recommended tutors for student (protected - student only)
router.get(
  "/recommended-tutors",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      const Tutor = require("../models/tutor.model");
      const User = require("../models/user.model");

      // Get top-rated tutors with basic info
      const tutors = await Tutor.find({
        isVerified: true,
      })
        .populate("user", "firstName lastName profileImage")
        .sort({ rating: -1 })
        .limit(6);

      const formattedTutors = tutors.map((tutor) => ({
        _id: tutor._id,
        name: `${tutor.user.firstName} ${tutor.user.lastName}`,
        profileImage: tutor.user.profileImage,
        rating: tutor.rating || 4.5,
        subjects: tutor.subjects || [],
        specialization: tutor.specialization || "General",
        hourlyRate: tutor.hourlyRate || 25,
        availability: tutor.availability || "Available",
      }));

      res.status(200).json({
        success: true,
        data: formattedTutors,
      });
    } catch (error) {
      console.error("Error fetching recommended tutors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recommended tutors",
        error: error.message,
      });
    }
  }
);

// GET dashboard statistics for student (protected - student only)
router.get(
  "/dashboard-stats",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const Session = require("../models/session.model");
      const Student = require("../models/student.model");
      const Tutor = require("../models/tutor.model");

      // Find student
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Get session statistics
      const sessionStats = await Session.aggregate([
        { $match: { student: student._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get total tutor count
      const totalTutors = await Tutor.countDocuments({ isVerified: true });

      // Process stats
      const stats = {
        totalSessions: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        cancelledSessions: 0,
      };

      sessionStats.forEach((stat) => {
        stats.totalSessions += stat.count;
        if (stat._id === "scheduled") stats.upcomingSessions = stat.count;
        if (stat._id === "completed") stats.completedSessions = stat.count;
        if (stat._id === "cancelled") stats.cancelledSessions = stat.count;
      });

      res.status(200).json({
        success: true,
        data: {
          ...stats,
          totalTutors,
          favoriteSubjects: student.favoriteSubjects || [],
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error.message,
      });
    }
  }
);

// GET total tutor count (protected - student only)
router.get(
  "/tutor-count",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      const Tutor = require("../models/tutor.model");
      const count = await Tutor.countDocuments({ isVerified: true });

      res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error fetching tutor count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tutor count",
        error: error.message,
      });
    }
  }
);

// GET notification count for student (protected - student only)
router.get(
  "/notifications/count",
  authenticateToken,
  checkRole(["student"]),
  async (req, res) => {
    try {
      // For now, return 0 as there's no notification system implemented
      // This can be enhanced later when notifications are added
      res.status(200).json({
        success: true,
        count: 0,
      });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notification count",
        error: error.message,
      });
    }
  }
);

module.exports = router;
