const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage locations
const DOCUMENT_PATH = "uploads/documents";
const PROFILE_IMAGE_PATH = "uploads/profileImages";

// Ensure upload directories exist
[DOCUMENT_PATH, PROFILE_IMAGE_PATH].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCUMENT_PATH);
  },
  filename: (req, file, cb) => {
    // Use userId from req.user (set by auth middleware) or fallback to timestamp
    const userId = req.user?.id || "anonymous";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${extension}`);
  },
});

// Storage configuration for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_IMAGE_PATH);
  },
  filename: (req, file, cb) => {
    // Use userId from req.user (set by auth middleware) or fallback to timestamp
    const userId = req.user?.id || "anonymous";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${extension}`);
  },
});

// File filter to validate document types
const documentFilter = (req, file, cb) => {
  const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedFileTypes.includes(extension)) {
    return cb(
      new Error(
        "Only PDF, DOC, DOCX, JPG, JPEG or PNG files are allowed for documents!",
      ),
      false,
    );
  }
  cb(null, true);
};

// File filter to validate image types
const imageFilter = (req, file, cb) => {
  const allowedFileTypes = [".jpg", ".jpeg", ".png"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedFileTypes.includes(extension)) {
    return cb(
      new Error("Only JPG, JPEG or PNG files are allowed for profile images!"),
      false,
    );
  }
  cb(null, true);
};

// Setup upload middleware for documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Setup upload middleware for profile images
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

module.exports = {
  uploadDocument,
  uploadProfileImage,
  DOCUMENT_PATH,
  PROFILE_IMAGE_PATH,
};
