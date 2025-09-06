const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { uploadProfileImage } = require("../middleware/uploads");
const User = require("../models/user.model");

const router = express.Router();

// GET user profile
router.get("/profile", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Get user profile - Not implemented yet" });
});

// UPDATE user profile
router.put("/profile", authenticateToken, (req, res) => {
  res
    .status(501)
    .json({ message: "Update user profile - Not implemented yet" });
});

// UPDATE password
router.put("/change-password", authenticateToken, (req, res) => {
  res.status(501).json({ message: "Change password - Not implemented yet" });
});

// Upload profile image
router.post(
  "/upload-profile-image",
  authenticateToken,
  uploadProfileImage.single("profileImage"),
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image file",
        });
      }

      // Get user ID from auth middleware
      const userId = req.user.id;

      // Update user with the profile image path
      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage: req.file.path.replace(/\\/g, "/") }, // Normalize path for cross-platform
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          profileImage: user.profileImage,
          user: user,
        },
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during profile image upload",
      });
    }
  }
);

// Get current user's details (protected - any authenticated user)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Debug endpoint to check user role (temporary)
router.get("/check-role", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    userId: req.user.id,
    userRole: req.user.role,
    tokenExists: !!req.header("Authorization"),
  });
});

module.exports = router;
