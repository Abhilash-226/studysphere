/**
 * JaaS (Jitsi as a Service) JWT Token Generator
 * Generates JWT tokens for authenticated Jitsi meetings
 */

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// JaaS Configuration
const JAAS_APP_ID = process.env.JAAS_APP_ID;
const JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");

/**
 * Generate a JWT token for JaaS (8x8 Jitsi)
 * @param {Object} options - Token options
 * @param {string} options.roomName - The meeting room name
 * @param {string} options.userName - User's display name
 * @param {string} options.userEmail - User's email
 * @param {string} options.moderator - Whether user is a moderator
 * @param {string} options.avatarUrl - User's avatar URL (optional)
 * @returns {string} JWT token
 */
const generateJaasToken = ({
  roomName,
  userName,
  userEmail,
  isModerator = false,
  userId,
  avatarUrl = "",
}) => {
  if (!JAAS_APP_ID || !JAAS_PRIVATE_KEY) {
    console.error("JaaS credentials not configured");
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3 * 60 * 60; // Token expires in 3 hours

  // Room name in JWT should be just the room identifier (without app ID prefix)
  const cleanRoomName = roomName.includes("/")
    ? roomName.split("/").pop()
    : roomName;

  console.log("JaaS Token Generation:", {
    originalRoomName: roomName,
    cleanRoomName,
    userName,
    userEmail,
    isModerator,
    appId: JAAS_APP_ID,
  });

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: JAAS_APP_ID,
    room: "*", // Allow any room - use wildcard for flexibility
    exp: exp,
    nbf: now - 10, // Not before (10 seconds ago to account for clock skew)
    context: {
      user: {
        id: userId || uuidv4(),
        name: userName,
        email: userEmail,
        avatar: avatarUrl,
        moderator: isModerator,
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
        "outbound-call": false,
      },
    },
  };

  try {
    const token = jwt.sign(payload, JAAS_PRIVATE_KEY, {
      algorithm: "RS256",
      header: {
        alg: "RS256",
        typ: "JWT",
        kid: `${JAAS_APP_ID}/default`,
      },
    });

    return token;
  } catch (error) {
    console.error("Error generating JaaS token:", error);
    return null;
  }
};

/**
 * Get the JaaS domain for meetings
 * @returns {string} JaaS domain
 */
const getJaasDomain = () => {
  return "8x8.vc";
};

/**
 * Get the full JaaS App ID (used in room names)
 * @returns {string} JaaS App ID
 */
const getJaasAppId = () => {
  return JAAS_APP_ID;
};

/**
 * Check if JaaS is configured
 * @returns {boolean} Whether JaaS is properly configured
 */
const isJaasConfigured = () => {
  return !!(JAAS_APP_ID && JAAS_PRIVATE_KEY);
};

module.exports = {
  generateJaasToken,
  getJaasDomain,
  getJaasAppId,
  isJaasConfigured,
};
