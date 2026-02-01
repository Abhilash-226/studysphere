const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary.config");

// Storage configuration for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "studysphere/documents",
    allowed_formats: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    resource_type: "auto",
  },
});

// Storage configuration for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "studysphere/profile_images",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// File filter to validate document types
const documentFilter = (req, file, cb) => {
  const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const extension = require("path").extname(file.originalname).toLowerCase();

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
  const extension = require("path").extname(file.originalname).toLowerCase();

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

// Storage configuration for mixed content (dynamic based on field name)
const mixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Default to documents settings
    let folder = "studysphere/documents";
    let allowed_formats = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    let transformation = []; // No transformation by default

    // Specific settings for profile image
    if (file.fieldname === "profileImage") {
      folder = "studysphere/profile_images";
      allowed_formats = ["jpg", "jpeg", "png"];
      transformation = [{ width: 500, height: 500, crop: "limit" }];
    }

    return {
      folder: folder,
      allowed_formats: allowed_formats,
      resource_type: "auto",
      transformation: transformation,
    };
  },
});

// File filter for mixed content
const mixedFilter = (req, file, cb) => {
  if (file.fieldname === "profileImage") {
    // Apply image filter logic
    const allowedImageTypes = [".jpg", ".jpeg", ".png"];
    const extension = require("path").extname(file.originalname).toLowerCase();
    if (!allowedImageTypes.includes(extension)) {
      return cb(
        new Error(
          "Only JPG, JPEG or PNG files are allowed for profile images!"
        ),
        false
      );
    }
  } else {
    // Apply document filter logic
    const allowedDocTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const extension = require("path").extname(file.originalname).toLowerCase();
    if (!allowedDocTypes.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, DOC, DOCX, JPG, JPEG or PNG files are allowed for documents!"
        ),
        false
      );
    }
  }
  cb(null, true);
};

// Setup upload middleware for mixed content (tutor profile)
const uploadMixed = multer({
  storage: mixedStorage,
  fileFilter: mixedFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit max for any file
});

module.exports = {
  uploadDocument,
  uploadProfileImage,
  uploadMixed,
};
