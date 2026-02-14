// Configuration for file uploads
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
};

// Document upload configuration
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the upload directory exists
    const uploadDir = path.join(__dirname, "../../uploads/documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${Date.now()}-${name}`);
  },
});

// Profile image upload configuration
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the upload directory exists
    const uploadDir = path.join(__dirname, "../../uploads/profileImages");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${Date.now()}-${name}`);
  },
});

// Classroom image upload configuration
const classroomImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the upload directory exists
    const uploadDir = path.join(__dirname, "../../uploads/classroomImages");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, `classroom-${Date.now()}-${name}`);
  },
});

// File filters
const documentFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid ? null : new Error("Invalid file type!");
  cb(error, isValid);
};

const imageFilter = (req, file, cb) => {
  const isValid =
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg";
  let error = isValid ? null : new Error("Only images are allowed!");
  cb(error, isValid);
};

// Export multer configurations
module.exports = {
  documentUpload: multer({
    storage: documentStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }),

  profileImageUpload: multer({
    storage: profileImageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }),

  classroomImageUpload: multer({
    storage: classroomImageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  }),
};
