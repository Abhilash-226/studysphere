const Session = require("../models/session.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const User = require("../models/user.model");

// Create a new session (Student books a session with tutor)
exports.createSession = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const {
      tutorId,
      subject,
      title,
      description,
      startTime,
      endTime,
      mode,
      location,
      notes,
    } = req.body;

    // Validate required fields
    if (!tutorId || !subject || !title || !startTime || !endTime || !mode) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: tutorId, subject, title, startTime, endTime, mode",
      });
    }

    // Find student record
    const student = await Student.findOne({ user: studentUserId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find tutor record and populate user details
    const tutor = await Tutor.findById(tutorId).populate("user");
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Validate session times
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(endTime);
    const now = new Date();

    if (sessionStart <= now) {
      return res.status(400).json({
        success: false,
        message: "Session start time must be in the future",
      });
    }

    if (sessionEnd <= sessionStart) {
      return res.status(400).json({
        success: false,
        message: "Session end time must be after start time",
      });
    }

    // Check for conflicting sessions for both tutor and student
    const conflictingSession = await Session.findOne({
      $or: [{ tutor: tutorId }, { student: student._id }],
      status: { $in: ["scheduled", "rescheduled"] },
      $or: [
        {
          startTime: { $lt: sessionEnd },
          endTime: { $gt: sessionStart },
        },
      ],
    });

    if (conflictingSession) {
      return res.status(409).json({
        success: false,
        message: "Time slot conflicts with an existing session",
      });
    }

    // Calculate session duration and price
    const durationHours = (sessionEnd - sessionStart) / (1000 * 60 * 60);
    const price = tutor.hourlyRate * durationHours;

    // Create session
    const session = new Session({
      title,
      tutor: tutorId,
      student: student._id,
      subject,
      description: description || "",
      startTime: sessionStart,
      endTime: sessionEnd,
      status: "scheduled",
      mode,
      location: mode === "offline" ? location : undefined,
      price,
      paymentStatus: "pending",
      notes: notes || "",
    });

    await session.save();

    // Populate session with user details for response
    await session.populate([
      {
        path: "tutor",
        populate: {
          path: "user",
          select: "firstName lastName email profileImage",
        },
      },
      {
        path: "student",
        populate: {
          path: "user",
          select: "firstName lastName email profileImage",
        },
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Session booked successfully",
      session: {
        id: session._id,
        title: session.title,
        subject: session.subject,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        mode: session.mode,
        location: session.location,
        price: session.price,
        status: session.status,
        tutor: {
          id: session.tutor._id,
          name: `${session.tutor.user.firstName} ${session.tutor.user.lastName}`,
          email: session.tutor.user.email,
          profileImage: session.tutor.user.profileImage,
        },
        student: {
          id: session.student._id,
          name: `${session.student.user.firstName} ${session.student.user.lastName}`,
          email: session.student.user.email,
          profileImage: session.student.user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: error.message,
    });
  }
};

// Get all sessions for current user
exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Find user's profile based on role
    if (userRole === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }
      console.log("=== getAllSessions Debug ===");
      console.log("User ID from token:", userId);
      console.log("Student profile found:", student._id.toString());
      console.log("Student profile user ID:", student.user.toString());
      console.log("=== End Debug ===");
      query.student = student._id;
    } else if (userRole === "tutor") {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }
      query.tutor = tutor._id;
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get sessions with pagination
    const sessions = await Session.find(query)
      .populate([
        {
          path: "tutor",
          populate: {
            path: "user",
            select: "firstName lastName email profileImage",
          },
        },
        {
          path: "student",
          populate: {
            path: "user",
            select: "firstName lastName email profileImage",
          },
        },
      ])
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSessions = await Session.countDocuments(query);

    // Format sessions for response
    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      title: session.title,
      subject: session.subject,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      mode: session.mode,
      location: session.location,
      price: session.price,
      status: session.status,
      paymentStatus: session.paymentStatus,
      rating: session.rating,
      tutor: {
        id: session.tutor._id,
        name: `${session.tutor.user.firstName} ${session.tutor.user.lastName}`,
        email: session.tutor.user.email,
        profileImage: session.tutor.user.profileImage,
      },
      student: {
        id: session.student._id,
        name: `${session.student.user.firstName} ${session.student.user.lastName}`,
        email: session.student.user.email,
        profileImage: session.student.user.profileImage,
      },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: page * limit < totalSessions,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

// Get tutor's sessions (teaching schedule)
exports.getTutorSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Find tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    let query = { tutor: tutor._id };

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get sessions with pagination
    const sessions = await Session.find(query)
      .populate([
        {
          path: "student",
          populate: {
            path: "user",
            select: "firstName lastName email profileImage",
          },
        },
      ])
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSessions = await Session.countDocuments(query);

    // Format sessions for tutor perspective
    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      title: session.title,
      subject: session.subject,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      mode: session.mode,
      location: session.location,
      price: session.price,
      status: session.status,
      paymentStatus: session.paymentStatus,
      rating: session.rating,
      review: session.review,
      student: {
        id: session.student._id,
        name: `${session.student.user.firstName} ${session.student.user.lastName}`,
        email: session.student.user.email,
        profileImage: session.student.user.profileImage,
        grade: session.student.grade,
        curriculum: session.student.curriculum,
      },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: page * limit < totalSessions,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tutor sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor sessions",
      error: error.message,
    });
  }
};

// Get single session by ID
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const session = await Session.findById(id).populate([
      {
        path: "tutor",
        populate: {
          path: "user",
          select: "firstName lastName email profileImage",
        },
      },
      {
        path: "student",
        populate: {
          path: "user",
          select: "firstName lastName email profileImage",
        },
      },
    ]);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user has access to this session
    console.log("=== Session Access Debug ===");
    console.log("User ID from token:", userId);
    console.log("User role from token:", userRole);
    console.log(
      "Session student user ID:",
      session.student?.user?._id?.toString()
    );
    console.log("Session tutor user ID:", session.tutor?.user?._id?.toString());

    // Fix: Convert userId to string for proper comparison
    const userIdString = userId.toString();

    const hasAccess =
      (userRole === "student" &&
        session.student.user._id.toString() === userIdString) ||
      (userRole === "tutor" &&
        session.tutor.user._id.toString() === userIdString);

    console.log("User ID as string:", userIdString);
    console.log(
      "Student comparison:",
      userRole === "student",
      session.student.user._id.toString() === userIdString
    );
    console.log("Has access:", hasAccess);
    console.log("=== End Debug ===");

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own sessions.",
      });
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        subject: session.subject,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        mode: session.mode,
        location: session.location,
        price: session.price,
        status: session.status,
        paymentStatus: session.paymentStatus,
        rating: session.rating,
        notes: session.notes,
        meetingLink: session.meetingLink,
        tutor: {
          id: session.tutor._id,
          name: `${session.tutor.user.firstName} ${session.tutor.user.lastName}`,
          email: session.tutor.user.email,
          profileImage: session.tutor.user.profileImage,
        },
        student: {
          id: session.student._id,
          name: `${session.student.user.firstName} ${session.student.user.lastName}`,
          email: session.student.user.email,
          profileImage: session.student.user.profileImage,
        },
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session",
      error: error.message,
    });
  }
};

// Cancel session
exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(id)
      .populate("tutor")
      .populate("student");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user has permission to cancel
    const canCancel =
      session.student.user.toString() === userId ||
      session.tutor.user.toString() === userId;

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to cancel this session",
      });
    }

    // Check if session can be cancelled (not already completed/cancelled)
    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    // Update session status
    session.status = "cancelled";
    session.cancelReason = reason || "No reason provided";
    session.cancelledAt = new Date();
    session.cancelledBy = userId;

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
      session: {
        id: session._id,
        status: session.status,
        cancelReason: session.cancelReason,
        cancelledAt: session.cancelledAt,
      },
    });
  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel session",
      error: error.message,
    });
  }
};

// Add review for session (student only)
exports.addSessionReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const session = await Session.findById(id)
      .populate("student")
      .populate("tutor");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is the student of this session
    if (session.student.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the student can review this session",
      });
    }

    // Check if session is completed
    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed sessions",
      });
    }

    // Check if already reviewed
    if (session.rating) {
      return res.status(400).json({
        success: false,
        message: "Session has already been reviewed",
      });
    }

    // Update session with review
    session.rating = rating;
    session.review = review || "";
    session.reviewedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      session: {
        id: session._id,
        rating: session.rating,
        review: session.review,
        reviewedAt: session.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Error adding session review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};

// Complete session (tutor only)
exports.completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(id)
      .populate("tutor")
      .populate("student");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is the tutor of this session
    if (session.tutor.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned tutor can complete this session",
      });
    }

    // Check if session is scheduled
    if (session.status !== "scheduled" && session.status !== "rescheduled") {
      return res.status(400).json({
        success: false,
        message: "Can only complete scheduled sessions",
      });
    }

    // Update session status
    session.status = "completed";
    session.completedAt = new Date();
    session.completionNotes = notes || "";

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      session: {
        id: session._id,
        status: session.status,
        completedAt: session.completedAt,
        completionNotes: session.completionNotes,
      },
    });
  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete session",
      error: error.message,
    });
  }
};

/**
 * Get session statistics for the current user
 */
exports.getSessionStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    if (userRole === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }
      query.student = student._id;
    } else if (userRole === "tutor") {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }
      query.tutor = tutor._id;
    }

    // Get session counts by status
    const [total, scheduled, completed, cancelled] = await Promise.all([
      Session.countDocuments(query),
      Session.countDocuments({ ...query, status: "scheduled" }),
      Session.countDocuments({ ...query, status: "completed" }),
      Session.countDocuments({ ...query, status: "cancelled" }),
    ]);

    // Calculate total earnings (for tutors) or total spent (for students)
    const totalAmount = await Session.aggregate([
      { $match: { ...query, status: { $in: ["completed", "scheduled"] } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const amount = totalAmount.length > 0 ? totalAmount[0].total : 0;

    // Get average rating (for tutors)
    let averageRating = null;
    if (userRole === "tutor") {
      const ratingResult = await Session.aggregate([
        { $match: { ...query, rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);
      averageRating =
        ratingResult.length > 0
          ? Math.round(ratingResult[0].avgRating * 10) / 10
          : null;
    }

    res.status(200).json({
      success: true,
      statistics: {
        total,
        scheduled,
        completed,
        cancelled,
        totalAmount: amount,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Error getting session statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get session statistics",
      error: error.message,
    });
  }
};

/**
 * Check tutor availability for a specific time slot
 */
exports.checkTutorAvailability = async (req, res) => {
  try {
    const { tutorId, startTime, endTime } = req.body;

    if (!tutorId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID, start time, and end time are required",
      });
    }

    // Validate tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Check for conflicting sessions
    const conflictingSessions = await Session.find({
      tutor: tutorId,
      status: { $in: ["scheduled", "completed"] },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    const isAvailable = conflictingSessions.length === 0;

    res.status(200).json({
      success: true,
      available: isAvailable,
      conflictingSessions: conflictingSessions.map((session) => ({
        id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        title: session.title,
      })),
    });
  } catch (error) {
    console.error("Error checking tutor availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check tutor availability",
      error: error.message,
    });
  }
};

/**
 * Get available time slots for a tutor on a specific date
 */
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    // Validate tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Parse date and get start/end of day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing sessions for the date
    const existingSessions = await Session.find({
      tutor: tutorId,
      status: { $in: ["scheduled"] },
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ startTime: 1 });

    // Generate available slots (9 AM to 6 PM in 1-hour slots)
    const availableSlots = [];
    const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if slot conflicts with existing sessions
      const hasConflict = existingSessions.some((session) => {
        return (
          new Date(session.startTime) < slotEnd &&
          new Date(session.endTime) > slotStart
        );
      });

      if (!hasConflict && slotStart > new Date()) {
        // Only future slots
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration: 60, // minutes
        });
      }
    }

    res.status(200).json({
      success: true,
      date: targetDate,
      availableSlots,
      existingSessions: existingSessions.map((session) => ({
        id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        title: session.title,
      })),
    });
  } catch (error) {
    console.error("Error getting available time slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get available time slots",
      error: error.message,
    });
  }
};

/**
 * Reschedule a session
 */
exports.rescheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStartTime, newEndTime, reason } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: "New start time and end time are required",
      });
    }

    // Find session
    const session = await Session.findById(id)
      .populate("student", "user name")
      .populate("tutor", "user name");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user has permission to reschedule
    const hasPermission =
      (userRole === "student" && session.student.user.toString() === userId) ||
      (userRole === "tutor" && session.tutor.user.toString() === userId);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to reschedule this session",
      });
    }

    // Validate session can be rescheduled
    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled sessions can be rescheduled",
      });
    }

    // Validate new times
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);
    const now = new Date();

    if (newStart <= now) {
      return res.status(400).json({
        success: false,
        message: "New session time must be in the future",
      });
    }

    if (newStart >= newEnd) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // Check for conflicts with tutor's other sessions
    const conflictingSessions = await Session.find({
      _id: { $ne: id },
      tutor: session.tutor._id,
      status: { $in: ["scheduled"] },
      $or: [
        {
          startTime: { $lt: newEnd },
          endTime: { $gt: newStart },
        },
      ],
    });

    if (conflictingSessions.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Tutor is not available at the requested time",
      });
    }

    // Update session
    session.startTime = newStart;
    session.endTime = newEnd;
    session.status = "rescheduled";
    session.rescheduleReason = reason || `Rescheduled by ${userRole}`;
    session.rescheduledAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session rescheduled successfully",
      session: {
        id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        rescheduleReason: session.rescheduleReason,
        rescheduledAt: session.rescheduledAt,
      },
    });
  } catch (error) {
    console.error("Error rescheduling session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reschedule session",
      error: error.message,
    });
  }
};
