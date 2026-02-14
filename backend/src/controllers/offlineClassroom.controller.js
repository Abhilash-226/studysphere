const OfflineClassroom = require("../models/offlineClassroom.model");
const Tutor = require("../models/tutor.model");
const User = require("../models/user.model");

/**
 * Offline Classroom Controller
 * Handles CRUD operations for physical/offline classrooms
 * Platform acts only as connector - no payment intermediary
 */

// ============ PUBLIC ENDPOINTS ============

/**
 * Get all active classrooms with filters
 * Public endpoint - no auth required
 */
exports.getAllClassrooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      pincode,
      area,
      subjects,
      minFee,
      maxFee,
      batchType,
      days,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { status: "active" };

    // Location filters
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }
    if (pincode) {
      query["location.pincode"] = pincode;
    }
    if (area) {
      query["location.area"] = { $regex: area, $options: "i" };
    }

    // Subject filter
    if (subjects) {
      const subjectList = subjects.split(",").map((s) => s.trim());
      query.subjects = { $in: subjectList };
    }

    // Fee range filter
    if (minFee || maxFee) {
      query["feeStructure.amount"] = {};
      if (minFee) query["feeStructure.amount"].$gte = parseInt(minFee);
      if (maxFee) query["feeStructure.amount"].$lte = parseInt(maxFee);
    }

    // Batch type filter
    if (batchType) {
      query["batchInfo.batchType"] = batchType;
    }

    // Days filter
    if (days) {
      const dayList = days.split(",").map((d) => d.trim().toLowerCase());
      query["schedule.days"] = { $in: dayList };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const classrooms = await OfflineClassroom.find(query)
      .populate({
        path: "tutor",
        populate: {
          path: "user",
          select: "firstName lastName profileImage",
        },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await OfflineClassroom.countDocuments(query);

    // Format response
    const formattedClassrooms = classrooms.map((classroom) => ({
      id: classroom._id,
      name: classroom.name,
      slug: classroom.slug,
      description: classroom.description,
      subjects: classroom.subjects,
      targetGrades: classroom.targetGrades,
      feeStructure: classroom.feeStructure,
      location: {
        area: classroom.location.area,
        city: classroom.location.city,
        state: classroom.location.state,
        pincode: classroom.location.pincode,
      },
      schedule: classroom.schedule,
      batchInfo: classroom.batchInfo,
      facilities: classroom.facilities,
      images: classroom.images,
      isVerified: classroom.isVerified,
      tutor: classroom.tutor
        ? {
            id: classroom.tutor._id,
            name: `${classroom.tutor.user?.firstName || ""} ${
              classroom.tutor.user?.lastName || ""
            }`.trim(),
            profileImage: classroom.tutor.user?.profileImage,
            qualification: classroom.tutor.qualification,
            experience: classroom.tutor.experience,
          }
        : null,
      stats: classroom.stats,
      createdAt: classroom.createdAt,
    }));

    res.status(200).json({
      success: true,
      classrooms: formattedClassrooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalClassrooms: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch classrooms",
      error: error.message,
    });
  }
};

/**
 * Get classroom by ID or slug
 * Public endpoint - no auth required
 */
exports.getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const classroom = await OfflineClassroom.findOne(query)
      .populate({
        path: "tutor",
        populate: {
          path: "user",
          select: "firstName lastName profileImage email",
        },
      })
      .lean();

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    // Increment view count
    await OfflineClassroom.findByIdAndUpdate(classroom._id, {
      $inc: { "stats.views": 1 },
    });

    res.status(200).json({
      success: true,
      classroom: {
        id: classroom._id,
        name: classroom.name,
        slug: classroom.slug,
        description: classroom.description,
        subjects: classroom.subjects,
        targetGrades: classroom.targetGrades,
        feeStructure: classroom.feeStructure,
        location: classroom.location,
        schedule: classroom.schedule,
        batchInfo: classroom.batchInfo,
        contactInfo: classroom.contactInfo,
        facilities: classroom.facilities,
        images: classroom.images,
        isVerified: classroom.isVerified,
        status: classroom.status,
        tutor: classroom.tutor
          ? {
              id: classroom.tutor._id,
              userId: classroom.tutor.user?._id,
              name: `${classroom.tutor.user?.firstName || ""} ${
                classroom.tutor.user?.lastName || ""
              }`.trim(),
              profileImage: classroom.tutor.user?.profileImage,
              email: classroom.tutor.user?.email,
              qualification: classroom.tutor.qualification,
              experience: classroom.tutor.experience,
              specialization: classroom.tutor.specialization,
            }
          : null,
        stats: classroom.stats,
        createdAt: classroom.createdAt,
        updatedAt: classroom.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch classroom details",
      error: error.message,
    });
  }
};

/**
 * Get unique cities for filter dropdown
 * Public endpoint
 */
exports.getCities = async (req, res) => {
  try {
    const cities = await OfflineClassroom.distinct("location.city", {
      status: "active",
    });

    res.status(200).json({
      success: true,
      cities: cities.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

/**
 * Get unique subjects for filter dropdown
 * Public endpoint
 */
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await OfflineClassroom.distinct("subjects", {
      status: "active",
    });

    res.status(200).json({
      success: true,
      subjects: subjects.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

/**
 * Record an inquiry (when someone views contact info)
 * Public endpoint
 */
exports.recordInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    await OfflineClassroom.findByIdAndUpdate(id, {
      $inc: { "stats.inquiries": 1 },
    });

    res.status(200).json({
      success: true,
      message: "Inquiry recorded",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record inquiry",
      error: error.message,
    });
  }
};

// ============ TUTOR ENDPOINTS ============

/**
 * Create a new classroom
 * Tutor only
 */
exports.createClassroom = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message:
          "Tutor profile not found. Please complete your tutor setup first.",
      });
    }

    // Check if tutor is verified
    if (tutor.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your tutor profile must be verified before creating classrooms.",
      });
    }

    const {
      name,
      description,
      subjects,
      targetGrades,
      feeStructure,
      location,
      schedule,
      batchInfo,
      contactInfo,
      facilities,
      images,
    } = req.body;

    // Create classroom
    const classroom = new OfflineClassroom({
      tutor: tutor._id,
      name,
      description,
      subjects,
      targetGrades,
      feeStructure,
      location,
      schedule,
      batchInfo,
      contactInfo,
      facilities,
      images,
      status: "active",
    });

    await classroom.save();

    res.status(201).json({
      success: true,
      message: "Classroom created successfully",
      classroom: {
        id: classroom._id,
        name: classroom.name,
        slug: classroom.slug,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create classroom",
      error: error.message,
    });
  }
};

/**
 * Update a classroom
 * Tutor only - can only update own classrooms
 */
exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find classroom and verify ownership
    const classroom = await OfflineClassroom.findById(id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    if (classroom.tutor.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own classrooms",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "description",
      "subjects",
      "targetGrades",
      "feeStructure",
      "location",
      "schedule",
      "batchInfo",
      "contactInfo",
      "facilities",
      "images",
      "status",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        classroom[field] = req.body[field];
      }
    });

    await classroom.save();

    res.status(200).json({
      success: true,
      message: "Classroom updated successfully",
      classroom: {
        id: classroom._id,
        name: classroom.name,
        slug: classroom.slug,
        status: classroom.status,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update classroom",
      error: error.message,
    });
  }
};

/**
 * Delete a classroom
 * Tutor only - can only delete own classrooms
 */
exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find classroom and verify ownership
    const classroom = await OfflineClassroom.findById(id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    if (classroom.tutor.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own classrooms",
      });
    }

    await OfflineClassroom.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Classroom deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete classroom",
      error: error.message,
    });
  }
};

/**
 * Get tutor's own classrooms
 * Tutor only
 */
exports.getMyClassrooms = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const classrooms = await OfflineClassroom.find({ tutor: tutor._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedClassrooms = classrooms.map((classroom) => ({
      id: classroom._id,
      name: classroom.name,
      slug: classroom.slug,
      subjects: classroom.subjects,
      feeStructure: classroom.feeStructure,
      location: {
        area: classroom.location.area,
        city: classroom.location.city,
      },
      schedule: classroom.schedule,
      batchInfo: classroom.batchInfo,
      status: classroom.status,
      isVerified: classroom.isVerified,
      stats: classroom.stats,
      createdAt: classroom.createdAt,
    }));

    res.status(200).json({
      success: true,
      classrooms: formattedClassrooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your classrooms",
      error: error.message,
    });
  }
};

/**
 * Toggle classroom status (active/inactive/paused)
 * Tutor only
 */
exports.toggleClassroomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ["active", "inactive", "paused"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: active, inactive, or paused",
      });
    }

    // Get tutor profile
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find and update classroom
    const classroom = await OfflineClassroom.findOne({
      _id: id,
      tutor: tutor._id,
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found or you don't have permission",
      });
    }

    classroom.status = status;
    await classroom.save();

    res.status(200).json({
      success: true,
      message: `Classroom ${
        status === "active"
          ? "activated"
          : status === "paused"
            ? "paused"
            : "deactivated"
      } successfully`,
      status: classroom.status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update classroom status",
      error: error.message,
    });
  }
};

/**
 * Upload classroom images
 * Tutor only - can upload up to 5 images
 * Images are stored on Cloudinary for persistent storage
 */
exports.uploadClassroomImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    // Get Cloudinary URLs from uploaded files
    // multer-storage-cloudinary stores the URL in file.path
    const imageUrls = req.files.map((file) => {
      return file.path; // This is the full Cloudinary URL
    });

    res.status(200).json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error uploading classroom images:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};
