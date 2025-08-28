const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// This function authenticates the token and adds the user to the request object
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or token is invalid" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "User account is disabled" });
    }

    // Add user to request
    req.user = {
      id: user._id,
      role: user.role,
    };

    // Log for debugging
    console.log(`Authenticated user: ${user._id} with role: ${user.role}`);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = {
  authenticateToken,
  // For backward compatibility
  default: authenticateToken,
};
