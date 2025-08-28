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
const sessionRoutes = require("./src/routes/session.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
); // Security headers with cross-origin resource policy
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.use("/api/sessions", sessionRoutes);

// Import chat routes
const chatRoutes = require("./src/routes/chat.routes");
app.use("/api/chat", chatRoutes);

// Import tutor chat routes
const tutorChatRoutes = require("./src/routes/tutor-chat.routes");
app.use("/api/tutor-chat", tutorChatRoutes);

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
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
