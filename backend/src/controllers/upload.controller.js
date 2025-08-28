const Tutor = require("../models/tutor.model");

// Upload ID document
exports.uploadIdDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Find associated tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Update tutor with the document path
    tutor.idDocument = req.file.path.replace(/\\/g, "/"); // Normalize path for cross-platform
    await tutor.save();

    res.status(200).json({
      message: "ID document uploaded successfully",
      filePath: tutor.idDocument,
    });
  } catch (error) {
    console.error("ID document upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};

// Upload qualification document
exports.uploadQualificationDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Find associated tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Update tutor with the document path
    tutor.qualificationDocument = req.file.path.replace(/\\/g, "/"); // Normalize path for cross-platform
    await tutor.save();

    res.status(200).json({
      message: "Qualification document uploaded successfully",
      filePath: tutor.qualificationDocument,
    });
  } catch (error) {
    console.error("Qualification document upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};
