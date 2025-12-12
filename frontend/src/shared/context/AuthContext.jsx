import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatService from "../services/chat.service";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token and user info on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData, token, role, customRedirect = null) => {
    const userObject = {
      ...userData,
      token,
      role,
    };

    // Store token both directly and within the user object for consistent access
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObject));

    // Initialize socket connection with new token
    chatService.disconnect(); // Ensure any existing connections are closed
    chatService.initSocket(token);

    setCurrentUser(userObject);
    setError(null);

    // Redirect based on custom path or role
    if (customRedirect) {
      navigate(customRedirect);
    } else if (role === "student") {
      navigate("/student/dashboard");
    } else if (role === "tutor") {
      navigate("/tutor/dashboard");
    }
  };

  // Logout function
  const logout = () => {
    // Clean up socket connections before logout
    chatService.disconnect();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser && !!currentUser.token;
  };

  // Get user role
  const getUserRole = () => {
    return currentUser ? currentUser.role : null;
  };

  // Update user data (useful for email verification status updates)
  const updateUser = (updatedFields) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    getUserRole,
    updateUser,
    setError,
    user: currentUser, // Alias for compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
