/**
 * Classroom Controller
 * Handles online classroom/meeting room functionality
 */

const Session = require("../models/session.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const crypto = require("crypto");
const {
  generateJaasToken,
  getJaasDomain,
  getJaasAppId,
  isJaasConfigured,
} = require("../utils/jaas");

/**
 * Generate a unique room ID for Jitsi meeting
 */
const generateRoomId = (sessionId) => {
  const hash = crypto.randomBytes(4).toString("hex");
  return `StudySphere${sessionId}${hash}`;
};

/**
 * Start a class (Tutor only)
 * Creates/activates the meeting room for a scheduled session
 */
exports.startClass = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Convert userId to string to ensure proper comparison
    const userId = req.user.id?.toString() || req.user.id;

    // Find the session
    const session = await Session.findById(sessionId)
      .populate({
        path: "tutor",
        populate: { path: "user", select: "firstName lastName email" },
      })
      .populate({
        path: "student",
        populate: { path: "user", select: "firstName lastName email" },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify the user is the tutor for this session
    const tutorUserId =
      session.tutor?.user?._id?.toString() || session.tutor?.user?.toString();
    if (tutorUserId !== userId) {
      console.log("startClass - tutorUserId:", tutorUserId, "userId:", userId);
      return res.status(403).json({
        success: false,
        message: "Only the assigned tutor can start this class",
      });
    }

    // Check if session is scheduled
    if (session.status !== "scheduled" && session.status !== "rescheduled") {
      return res.status(400).json({
        success: false,
        message: `Cannot start class. Session status is: ${session.status}`,
      });
    }

    // Check if it's an online session
    if (session.mode !== "online") {
      return res.status(400).json({
        success: false,
        message: "This is not an online session",
      });
    }

    // Check if class can be started (within 15 minutes before start time or after)
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const earlyJoinMinutes = 15;
    const earliestStart = new Date(
      startTime.getTime() - earlyJoinMinutes * 60 * 1000,
    );

    if (now < earliestStart) {
      const minutesUntilStart = Math.ceil((earliestStart - now) / (60 * 1000));
      return res.status(400).json({
        success: false,
        message: `Class can be started ${earlyJoinMinutes} minutes before the scheduled time. Please wait ${minutesUntilStart} more minutes.`,
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: "Session time has already passed",
      });
    }

    // Generate or use existing room ID
    let roomId = session.meetingRoom?.roomId;
    if (!roomId) {
      roomId = generateRoomId(sessionId);
    }

    // Determine domain and URL based on JaaS configuration
    const useJaas = isJaasConfigured();
    const domain = useJaas ? getJaasDomain() : "meet.jit.si";
    const jaasAppId = useJaas ? getJaasAppId() : null;

    // For JaaS, room name must include the app ID
    const fullRoomName = useJaas ? `${jaasAppId}/${roomId}` : roomId;
    const roomUrl = useJaas
      ? `https://${domain}/${fullRoomName}`
      : `https://${domain}/${roomId}`;

    // Generate JWT token for tutor (moderator)
    let jwtToken = null;
    if (useJaas) {
      jwtToken = generateJaasToken({
        roomName: roomId,
        userName: `${session.tutor.user.firstName} ${session.tutor.user.lastName}`,
        userEmail: session.tutor.user.email,
        isModerator: true, // Tutor is always moderator
        userId: userId,
      });
    }

    // Update session with meeting room details
    session.meetingRoom = {
      roomId,
      roomUrl,
      isActive: true,
      startedAt: now,
      startedBy: userId,
      endedAt: null,
    };
    session.meetingLink = roomUrl;

    await session.save();

    res.status(200).json({
      success: true,
      message: "Class started successfully",
      data: {
        roomId,
        roomUrl,
        domain,
        jaasAppId,
        jwt: jwtToken,
        useJaas,
        sessionId: session._id,
        title: session.title,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        student: {
          name: `${session.student.user.firstName} ${session.student.user.lastName}`,
          email: session.student.user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error starting class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start class",
      error: error.message,
    });
  }
};

/**
 * Join a class (Student or Tutor)
 * Returns the meeting room URL if class is active
 */
exports.joinClass = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Convert userId to string to ensure proper comparison
    const userId = req.user.id?.toString() || req.user.id;
    const userRole = req.user.role;

    // Find the session
    const session = await Session.findById(sessionId)
      .populate({
        path: "tutor",
        populate: { path: "user", select: "firstName lastName email _id" },
      })
      .populate({
        path: "student",
        populate: { path: "user", select: "firstName lastName email _id" },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify the user is either the tutor or student for this session
    const tutorUserId =
      session.tutor?.user?._id?.toString() || session.tutor?.user?.toString();
    const studentUserId =
      session.student?.user?._id?.toString() ||
      session.student?.user?.toString();
    const isTutor = tutorUserId === userId;
    const isStudent = studentUserId === userId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to join this class",
      });
    }

    // Check if it's an online session
    if (session.mode !== "online") {
      return res.status(400).json({
        success: false,
        message: "This is not an online session",
      });
    }

    // Check if class has been started by tutor
    if (!session.meetingRoom?.isActive) {
      // If user is tutor, suggest starting the class
      if (isTutor) {
        return res.status(400).json({
          success: false,
          message: "Please start the class first",
          canStart: true,
        });
      }
      // If student, inform them to wait
      return res.status(400).json({
        success: false,
        message:
          "The class has not been started yet. Please wait for the tutor to start the class.",
        canStart: false,
      });
    }

    // Check if session time is valid
    const now = new Date();
    const endTime = new Date(session.endTime);
    const graceMinutes = 30; // Allow 30 minutes after scheduled end
    const latestJoin = new Date(endTime.getTime() + graceMinutes * 60 * 1000);

    if (now > latestJoin) {
      return res.status(400).json({
        success: false,
        message: "Session time has ended",
      });
    }

    // Determine domain and generate JWT based on JaaS configuration
    const useJaas = isJaasConfigured();
    const domain = useJaas ? getJaasDomain() : "meet.jit.si";
    const jaasAppId = useJaas ? getJaasAppId() : null;

    // Generate JWT token for the user
    let jwtToken = null;
    if (useJaas) {
      const currentUser = isTutor ? session.tutor.user : session.student.user;
      jwtToken = generateJaasToken({
        roomName: session.meetingRoom.roomId,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userEmail: currentUser.email,
        isModerator: isTutor, // Only tutor is moderator
        userId: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Joining class",
      data: {
        roomId: session.meetingRoom.roomId,
        roomUrl: session.meetingRoom.roomUrl,
        domain,
        jaasAppId,
        jwt: jwtToken,
        useJaas,
        sessionId: session._id,
        title: session.title,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        role: isTutor ? "tutor" : "student",
        otherParticipant: isTutor
          ? {
              name: `${session.student.user.firstName} ${session.student.user.lastName}`,
              role: "Student",
            }
          : {
              name: `${session.tutor.user.firstName} ${session.tutor.user.lastName}`,
              role: "Tutor",
            },
      },
    });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join class",
      error: error.message,
    });
  }
};

/**
 * End a class (Tutor only)
 * Deactivates the meeting room
 */
exports.endClass = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Convert userId to string to ensure proper comparison
    const userId = req.user.id?.toString() || req.user.id;

    // Find the session
    const session = await Session.findById(sessionId).populate({
      path: "tutor",
      populate: { path: "user", select: "_id" },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify the user is the tutor
    const tutorUserId =
      session.tutor?.user?._id?.toString() || session.tutor?.user?.toString();
    if (tutorUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the tutor can end this class",
      });
    }

    // Update meeting room status
    if (session.meetingRoom) {
      session.meetingRoom.isActive = false;
      session.meetingRoom.endedAt = new Date();
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: "Class ended successfully",
    });
  } catch (error) {
    console.error("Error ending class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end class",
      error: error.message,
    });
  }
};

/**
 * Get class status
 * Returns whether the class is active and meeting details
 */
exports.getClassStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // Convert userId to string to ensure proper comparison
    const userId = req.user.id?.toString() || req.user.id;

    console.log("=== getClassStatus DEBUG START ===");
    console.log("sessionId:", sessionId);
    console.log("userId (from token):", userId);

    // Find the session
    const session = await Session.findById(sessionId)
      .populate({
        path: "tutor",
        populate: { path: "user", select: "firstName lastName _id" },
      })
      .populate({
        path: "student",
        populate: { path: "user", select: "firstName lastName _id" },
      });

    if (!session) {
      console.log("Session NOT FOUND in database!");
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify user belongs to this session
    // Handle both populated and non-populated cases, always convert to string
    const tutorUserId =
      session.tutor?.user?._id?.toString() || session.tutor?.user?.toString();
    const studentUserId =
      session.student?.user?._id?.toString() ||
      session.student?.user?.toString();

    console.log("Extracted user IDs:");
    console.log("- tutorUserId:", tutorUserId);
    console.log("- studentUserId:", studentUserId);
    console.log("- current userId:", userId);

    const isTutor = tutorUserId === userId;
    const isStudent = studentUserId === userId;

    console.log("Final authorization:", { isTutor, isStudent });
    console.log("=== getClassStatus DEBUG END ===");

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this class",
      });
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const earlyJoinMinutes = 15;
    const earliestStart = new Date(
      startTime.getTime() - earlyJoinMinutes * 60 * 1000,
    );

    // Determine class status
    let classStatus = "not-started";
    let canStart = false;
    let canJoin = false;

    if (session.meetingRoom?.isActive) {
      classStatus = "in-progress";
      canJoin = true;
    } else if (now < earliestStart) {
      classStatus = "scheduled";
    } else if (now >= earliestStart && now <= endTime) {
      classStatus = "ready";
      canStart = isTutor;
    } else if (now > endTime) {
      classStatus = "ended";
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        title: session.title,
        subject: session.subject,
        mode: session.mode,
        status: session.status,
        classStatus,
        canStart,
        canJoin,
        isTutor,
        isStudent,
        startTime: session.startTime,
        endTime: session.endTime,
        meetingRoom: session.meetingRoom?.isActive
          ? {
              roomUrl: session.meetingRoom.roomUrl,
              startedAt: session.meetingRoom.startedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error getting class status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class status",
      error: error.message,
    });
  }
};
