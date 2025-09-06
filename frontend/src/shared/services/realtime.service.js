import { io } from "socket.io-client";

class RealtimeService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
    this.isConnected = false;
  }

  /**
   * Initialize WebSocket connection
   */
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found for WebSocket connection");
      return null;
    }

    this.socket = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000",
      {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      }
    );

    this.setupEventHandlers();
    return this.socket;
  }

  /**
   * Setup basic event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.isConnected = true;
      this.emit("connection", { status: "connected" });
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
      this.emit("connection", { status: "disconnected" });
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
      this.emit("connection", { status: "error", error });
    });

    // Dashboard-specific events
    this.socket.on("dashboard_update", (data) => {
      this.emit("dashboard_update", data);
    });

    this.socket.on("session_update", (data) => {
      this.emit("session_update", data);
    });

    this.socket.on("session_request_update", (data) => {
      this.emit("session_request_update", data);
    });

    this.socket.on("message_stats_update", (data) => {
      this.emit("message_stats_update", data);
    });

    this.socket.on("verification_status_update", (data) => {
      this.emit("verification_status_update", data);
    });
  }

  /**
   * Subscribe to dashboard updates for a specific user role
   * @param {string} role - User role (student/tutor)
   */
  subscribeToDashboard(role) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.emit("subscribe_dashboard", { role });
    }
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribeFromDashboard() {
    if (this.socket) {
      this.socket.emit("unsubscribe_dashboard");
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Request real-time data refresh
   * @param {string} dataType - Type of data to refresh (sessions, messages, etc.)
   */
  requestDataRefresh(dataType) {
    if (this.socket && this.isConnected) {
      this.socket.emit("request_data_refresh", { dataType });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

// Export singleton instance
export default new RealtimeService();
