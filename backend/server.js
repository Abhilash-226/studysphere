const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const tutorRoutes = require("./src/routes/tutor.routes");
const studentRoutes = require("./src/routes/student.routes");
const studentProfileRoutes = require("./src/routes/studentProfile.routes");
const sessionRoutes = require("./src/routes/session.routes");
const sessionRequestRoutes = require("./src/routes/sessionRequest.routes");
const adminRoutes = require("./src/routes/admin.routes");
const classroomRoutes = require("./src/routes/classroom.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const offlineClassroomRoutes = require("./src/routes/offlineClassroom.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
); // Security headers with cross-origin resource policy

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, true); // Allow all origins in production for now
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-profiles", studentProfileRoutes);
app.use("/api/sessions", sessionRoutes);

console.log("Loading session request routes...");
app.use("/api/session-requests", sessionRequestRoutes);
console.log("Session request routes loaded successfully");

// Import chat routes
const chatRoutes = require("./src/routes/chat.routes");
app.use("/api/chat", chatRoutes);

// Import tutor chat routes
const tutorChatRoutes = require("./src/routes/tutor-chat.routes");
app.use("/api/tutor-chat", tutorChatRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Classroom routes (online class functionality)
app.use("/api/classroom", classroomRoutes);

// Offline Classroom Marketplace routes
app.use("/api/offline-classrooms", offlineClassroomRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("StudySphere API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME || "studysphere",
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Create HTTP server
    const server = require("http").createServer(app);

    // Initialize Socket.io
    const io = require("socket.io")(server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both ports
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Setup WebSocket service
    const setupWebSocket = require("./src/services/websocket.service");
    const websocketService = setupWebSocket(io);

    // Connect chat service with websocket service
    const chatService = require("./src/services/chat.service");
    chatService.setWebSocketService(websocketService);

    // WebSocket service is now set up and connected to chat service

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`WebSocket server initialized`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
