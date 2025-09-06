const SessionRequest = require("../models/sessionRequest.model");
const Session = require("../models/session.model");
const Student = require("../models/student.model");
const Tutor = require("../models/tutor.model");
const User = require("../models/user.model");

/**
 * Create a new session request
 */
exports.createSessionRequest = async (req, res) => {
  console.log("=== createSessionRequest function called ===");
  console.log("Request body:", req.body);
  console.log("User:", req.user);

  try {
    const {
      tutorId,
      subject,
      title,
      description,
      requestedStartTime,
      requestedEndTime,
      mode,
      location,
      proposedPrice,
      message,
    } = req.body;

    const userId = req.user.id || req.user.userId;
    console.log("Extracted userId:", userId);

    // Validate required fields
    if (
      !tutorId ||
      !subject ||
      !title ||
      !requestedStartTime ||
      !requestedEndTime ||
      !mode ||
      proposedPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find student profile
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
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

    // Validate times
    const startTime = new Date(requestedStartTime);
    const endTime = new Date(requestedEndTime);
    const now = new Date();

    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: "Session time must be in the future",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // Check if student already has a pending request with this tutor for similar time
    const existingRequest = await SessionRequest.findOne({
      student: student._id,
      tutor: tutorId,
      status: "pending",
      requestedStartTime: {
        $gte: new Date(startTime.getTime() - 60 * 60 * 1000), // 1 hour before
        $lte: new Date(startTime.getTime() + 60 * 60 * 1000), // 1 hour after
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending request with this tutor for a similar time",
      });
    }

    // Create session request
    const sessionRequest = new SessionRequest({
      student: student._id,
      tutor: tutorId,
      subject,
      title,
      description,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      mode,
      location: mode === "offline" ? location : null,
      proposedPrice,
      message,
    });

    await sessionRequest.save();

    // Populate the created request for response
    const populatedRequest = await SessionRequest.findById(sessionRequest._id)
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage subjects hourlyRate");

    // Notify tutor about new session request via WebSocket
    const {
      notifySessionRequestUpdate,
    } = require("../services/websocket.service");
    if (notifySessionRequestUpdate) {
      notifySessionRequestUpdate(tutorId, {
        action: "created",
        request: populatedRequest,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Session request sent successfully",
      sessionRequest: populatedRequest,
    });
  } catch (error) {
    console.error("=== ERROR in createSessionRequest ===");
    console.error("Error creating session request:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create session request",
      error: error.message,
    });
  }
};

/**
 * Get session requests for current user
 */
exports.getSessionRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const userRole = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    let populateFields = "";

    if (userRole === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }
      query.student = student._id;
      populateFields = "tutor";
    } else if (userRole === "tutor") {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }
      query.tutor = tutor._id;
      populateFields = "student";
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [sessionRequests, total] = await Promise.all([
      SessionRequest.find(query)
        .populate(populateFields, "name email profileImage subjects hourlyRate")
        .populate("sessionId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SessionRequest.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      sessionRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching session requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session requests",
      error: error.message,
    });
  }
};

/**
 * Accept a session request (tutor only)
 */
exports.acceptSessionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorResponse } = req.body;
    const userId = req.user.id || req.user.userId;

    // Find the tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find the session request
    const sessionRequest = await SessionRequest.findById(id)
      .populate("student")
      .populate("tutor");

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: "Session request not found",
      });
    }

    // Check if the tutor owns this request
    if (sessionRequest.tutor._id.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to your own session requests",
      });
    }

    // Check if request is still pending
    if (sessionRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This session request has already been responded to",
      });
    }

    // Check if tutor is available at the requested time
    const conflictingSessions = await Session.find({
      tutor: tutor._id,
      status: { $in: ["scheduled", "completed"] },
      $or: [
        {
          startTime: { $lt: sessionRequest.requestedEndTime },
          endTime: { $gt: sessionRequest.requestedStartTime },
        },
      ],
    });

    if (conflictingSessions.length > 0) {
      console.log(
        "Conflicting sessions found:",
        conflictingSessions.map((s) => ({
          id: s._id,
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
        }))
      );
      console.log("Requested time:", {
        startTime: sessionRequest.requestedStartTime,
        endTime: sessionRequest.requestedEndTime,
      });

      return res.status(409).json({
        success: false,
        message: "You have a conflicting session at this time",
        details: {
          conflictingCount: conflictingSessions.length,
          requestedTime: {
            start: sessionRequest.requestedStartTime,
            end: sessionRequest.requestedEndTime,
          },
          conflictingSessions: conflictingSessions.map((session) => ({
            id: session._id,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
          })),
        },
      });
    }

    // Create the actual session
    const session = new Session({
      student: sessionRequest.student._id,
      tutor: tutor._id,
      subject: sessionRequest.subject,
      title: sessionRequest.title,
      description: sessionRequest.description,
      startTime: sessionRequest.requestedStartTime,
      endTime: sessionRequest.requestedEndTime,
      mode: sessionRequest.mode,
      location: sessionRequest.location,
      price: sessionRequest.proposedPrice,
      status: "scheduled",
    });

    await session.save();

    // Update session request status
    sessionRequest.status = "accepted";
    sessionRequest.tutorResponse = tutorResponse || "Request accepted";
    sessionRequest.respondedAt = new Date();
    sessionRequest.sessionId = session._id;

    await sessionRequest.save();

    // Notify both student and tutor about the update
    const {
      notifySessionRequestUpdate,
      notifySessionUpdate,
    } = require("../services/websocket.service");
    if (notifySessionRequestUpdate && notifySessionUpdate) {
      // Notify tutor about request status change
      notifySessionRequestUpdate(userId, {
        action: "updated",
        request: sessionRequest,
        timestamp: new Date(),
      });

      // Notify both student and tutor about the new session
      notifySessionUpdate([sessionRequest.student, userId], {
        action: "created",
        session: session,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Session request accepted successfully",
      sessionRequest,
      session,
    });
  } catch (error) {
    console.error("Error accepting session request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept session request",
      error: error.message,
    });
  }
};

/**
 * Decline a session request (tutor only)
 */
exports.declineSessionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { declineReason, tutorResponse } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!declineReason) {
      return res.status(400).json({
        success: false,
        message: "Decline reason is required",
      });
    }

    // Find the tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find the session request
    const sessionRequest = await SessionRequest.findById(id)
      .populate("student")
      .populate("tutor");

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: "Session request not found",
      });
    }

    // Check if the tutor owns this request
    if (sessionRequest.tutor._id.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to your own session requests",
      });
    }

    // Check if request is still pending
    if (sessionRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This session request has already been responded to",
      });
    }

    // Update session request status
    sessionRequest.status = "declined";
    sessionRequest.declineReason = declineReason;
    sessionRequest.tutorResponse = tutorResponse || declineReason;
    sessionRequest.respondedAt = new Date();

    await sessionRequest.save();

    res.status(200).json({
      success: true,
      message: "Session request declined",
      sessionRequest,
    });
  } catch (error) {
    console.error("Error declining session request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline session request",
      error: error.message,
    });
  }
};

/**
 * Cancel a session request (student only)
 */
exports.cancelSessionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    // Find the student
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find the session request
    const sessionRequest = await SessionRequest.findById(id);

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: "Session request not found",
      });
    }

    // Check if the student owns this request
    if (sessionRequest.student.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own session requests",
      });
    }

    // Check if request is still pending
    if (sessionRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending session requests can be cancelled",
      });
    }

    // Update session request status
    sessionRequest.status = "cancelled";
    sessionRequest.respondedAt = new Date();

    await sessionRequest.save();

    res.status(200).json({
      success: true,
      message: "Session request cancelled",
      sessionRequest,
    });
  } catch (error) {
    console.error("Error cancelling session request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel session request",
      error: error.message,
    });
  }
};

/**
 * Get session request statistics
 */
exports.getSessionRequestStatistics = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const userRole = req.user.role;

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

    const [total, pending, accepted, declined, cancelled] = await Promise.all([
      SessionRequest.countDocuments(query),
      SessionRequest.countDocuments({ ...query, status: "pending" }),
      SessionRequest.countDocuments({ ...query, status: "accepted" }),
      SessionRequest.countDocuments({ ...query, status: "declined" }),
      SessionRequest.countDocuments({ ...query, status: "cancelled" }),
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        total,
        pending,
        accepted,
        declined,
        cancelled,
      },
    });
  } catch (error) {
    console.error("Error getting session request statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get session request statistics",
      error: error.message,
    });
  }
};
