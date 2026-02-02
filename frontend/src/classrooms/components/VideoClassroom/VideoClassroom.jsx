/**
 * VideoClassroom Component
 * Embeds Jitsi Meet video conferencing for online classes
 * Supports both public Jitsi and JaaS (8x8) with JWT authentication
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Button,
  Alert,
  Spinner,
  Card,
  Badge,
} from "react-bootstrap";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaPhone,
  FaUsers,
  FaComments,
  FaExpand,
  FaClock,
  FaUser,
} from "react-icons/fa";
import "./VideoClassroom.css";

const VideoClassroom = ({
  roomId,
  roomUrl,
  userName,
  userEmail,
  sessionTitle,
  subject,
  startTime,
  endTime,
  otherParticipant,
  userRole,
  onLeave,
  onEnd,
  // JaaS specific props
  domain: propDomain,
  jaasAppId,
  jwt,
  useJaas,
}) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionDuration, setSessionDuration] = useState("00:00:00");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("initializing");

  // Request camera and microphone permissions before loading Jitsi
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        setConnectionStatus("requesting-permissions");
        // Request both camera and microphone permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        // Stop the streams immediately - we just needed to get permission
        stream.getTracks().forEach((track) => track.stop());
        setPermissionsGranted(true);
        setPermissionError(null);
        setConnectionStatus("permissions-granted");
      } catch (err) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setPermissionError(
            "Camera and microphone access is required. Please click the camera icon in your browser's address bar and allow access, then refresh this page.",
          );
        } else if (err.name === "NotFoundError") {
          setPermissionError(
            "No camera or microphone found. Please connect a device and refresh.",
          );
        } else {
          setPermissionError(
            `Could not access camera/microphone: ${err.message}`,
          );
        }
        setLoading(false);
      }
    };

    requestPermissions();
  }, []);

  // Calculate and update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setSessionDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Initialize Jitsi Meet (only after permissions are granted)
  useEffect(() => {
    // Don't initialize until permissions are granted
    if (!permissionsGranted) return;

    let loadTimeout = null;
    let isMounted = true;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already loaded
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        setConnectionStatus("loading-jitsi");

        // Load script from appropriate domain
        const scriptDomain = useJaas ? "8x8.vc" : "meet.jit.si";
        const script = document.createElement("script");
        script.src = `https://${scriptDomain}/external_api.js`;
        script.async = true;
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          reject(new Error("Failed to load video conferencing library"));
        };
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        setConnectionStatus("loading-script");
        await loadJitsiScript();

        if (!isMounted || !jitsiContainerRef.current) return;

        setConnectionStatus("initializing-jitsi");

        // Use JaaS domain if configured, otherwise fall back to public Jitsi
        const domain = useJaas && propDomain ? propDomain : "meet.jit.si";

        // For JaaS, room name must include the app ID
        // For public Jitsi, use simple room name
        let roomName;
        if (useJaas && jaasAppId) {
          roomName = `${jaasAppId}/${roomId}`;
        } else {
          roomName = roomId.includes("StudySphere")
            ? roomId
            : `StudySphere_${roomId}`;
        }

        // Log room configuration for debugging
        console.log("Jitsi Room Configuration:", {
          useJaas,
          domain,
          jaasAppId,
          originalRoomId: roomId,
          computedRoomName: roomName,
          hasJwt: !!jwt,
          userName,
          userRole,
        });

        // Determine if user should be moderator (tutors are moderators)
        const isModerator = userRole === "tutor";

        const options = {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          // Include JWT token if using JaaS
          ...(useJaas && jwt ? { jwt: jwt } : {}),
          userInfo: {
            displayName: userName,
            email: userEmail,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            // Skip pre-join to go directly into meeting
            prejoinPageEnabled: false,
            prejoinConfig: {
              enabled: false,
            },
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableInviteFunctions: true,
            hideConferenceSubject: false,
            subject: `${sessionTitle} - ${subject}`,
            // CRITICAL: Disable all lobby/moderator/authentication features
            enableLobby: false,
            lobby: {
              autoKnock: true,
              enableChat: false,
            },
            // Security settings - make room public
            roomPasswordNumberOfDigits: 0,
            enableInsecureRoomNameWarning: false,
            requireDisplayName: false,
            // Disable moderator-related features
            disableModeratorIndicator: true,
            enableUserRolesBasedOnToken: false,
            // Meeting behavior
            startAudioOnly: false,
            enableNoisyMicDetection: false,
            // Disable any authentication
            enableAutomaticUrlCopy: false,
            // P2P for better performance in 1-on-1 calls
            p2p: {
              enabled: true,
              stunServers: [
                { urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" },
              ],
            },
            // Make everyone a moderator (all participants have equal rights)
            disableRemoteMute: false,
            remoteVideoMenu: {
              disableKick: true,
              disableGrantModerator: true,
            },
            // Notifications
            notifications: [],
            disabledNotifications: [
              "lobby.notificationTitle",
              "notify.moderator",
            ],
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "chat",
              "raisehand",
              "participants-pane",
              "videoquality",
              "tileview",
              "settings",
              "hangup",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#1a1a2e",
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            // Disable pre-join UI elements
            DISABLE_PRESENCE_STATUS: true,
            // Make lobby-related buttons hidden
            TOOLBAR_ALWAYS_VISIBLE: true,
          },
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        setConnectionStatus("connecting");

        // Set a timeout to hide loading after max 8 seconds
        loadTimeout = setTimeout(() => {
          if (isMounted) {
            setLoading(false);
            setConnectionStatus("connected");
          }
        }, 8000);

        // Event listeners
        jitsiApiRef.current.addListener("videoConferenceJoined", () => {
          if (isMounted) {
            clearTimeout(loadTimeout);
            setLoading(false);
            setConnectionStatus("in-meeting");
          }
        });

        jitsiApiRef.current.addListener("videoConferenceLeft", () => {
          if (onLeave) onLeave();
        });

        jitsiApiRef.current.addListener("readyToClose", () => {
          if (onLeave) onLeave();
        });

        // Handle connection errors
        jitsiApiRef.current.addListener("errorOccurred", (error) => {
          if (isMounted && error.error?.name === "conference.connectionError") {
            setError(
              "Connection failed. Please check your internet and try again.",
            );
            setLoading(false);
          }
        });
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              "Failed to load video conferencing. Please try again.",
          );
          setLoading(false);
        }
      }
    };

    initJitsi();

    // Cleanup
    return () => {
      isMounted = false;
      if (loadTimeout) clearTimeout(loadTimeout);
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [
    roomId,
    userName,
    userEmail,
    sessionTitle,
    subject,
    userRole,
    onLeave,
    permissionsGranted,
    // JaaS specific dependencies
    propDomain,
    jaasAppId,
    jwt,
    useJaas,
  ]);

  const handleEndClass = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("hangup");
    }
    if (onEnd) onEnd();
  };

  const handleLeaveClass = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("hangup");
    }
    if (onLeave) onLeave();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (permissionError) {
    return (
      <Container className="video-classroom-error py-5">
        <Alert variant="warning">
          <Alert.Heading>
            <FaVideo className="me-2" />
            Camera & Microphone Required
          </Alert.Heading>
          <p>{permissionError}</p>
          <hr />
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline-secondary" onClick={onLeave}>
              Go Back
            </Button>
          </div>
          <div className="mt-3">
            <small className="text-muted">
              <strong>Tip:</strong> Look for the camera icon (🎥) in your
              browser's address bar and click "Allow" for both camera and
              microphone.
            </small>
          </div>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="video-classroom-error py-5">
        <Alert variant="danger">
          <Alert.Heading>Unable to Load Video Conference</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={onLeave}>
              Go Back
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open(roomUrl, "_blank")}
            >
              Open in New Tab
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="video-classroom">
      {/* Session Info Header */}
      <div className="classroom-header">
        <div className="header-left">
          <h4 className="session-title">{sessionTitle}</h4>
          <span className="session-subject">
            <Badge bg="primary">{subject}</Badge>
          </span>
        </div>
        <div className="header-center">
          <div className="session-timer">
            <FaClock className="timer-icon" />
            <span className="timer-value">{sessionDuration}</span>
          </div>
          <div className="session-schedule">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
        </div>
        <div className="header-right">
          <div className="participant-info">
            <FaUser className="participant-icon" />
            <span>
              {otherParticipant?.name} ({otherParticipant?.role})
            </span>
          </div>
          {userRole === "tutor" ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndClass}
              className="end-class-btn"
            >
              End Class
            </Button>
          ) : (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLeaveClass}
              className="leave-class-btn"
            >
              Leave Class
            </Button>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container">
        {loading && (
          <div className="loading-overlay">
            <Spinner animation="border" variant="light" />
            <p>
              {connectionStatus === "requesting-permissions" &&
                "Requesting camera & microphone access..."}
              {connectionStatus === "loading-script" &&
                "Loading video conferencing..."}
              {connectionStatus === "loading-jitsi" &&
                "Loading video library..."}
              {connectionStatus === "initializing-jitsi" &&
                "Initializing video room..."}
              {connectionStatus === "connecting" &&
                "Connecting to classroom..."}
              {!connectionStatus && "Preparing classroom..."}
            </p>
            {(connectionStatus === "connecting" ||
              connectionStatus === "initializing-jitsi") && (
              <small className="text-muted mt-2 d-block">
                This may take a few seconds...
              </small>
            )}
            <Button
              variant="outline-light"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Taking too long? Refresh
            </Button>
          </div>
        )}
        <div ref={jitsiContainerRef} className="jitsi-container" />
      </div>
    </div>
  );
};

export default VideoClassroom;
