const mongoose = require("mongoose");

/**
 * Offline Classroom Model
 * Represents physical/offline classrooms posted by tutors
 * Students can browse and contact tutors directly
 */
const offlineClassroomSchema = new mongoose.Schema(
  {
    // Reference to the tutor who created this classroom
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    // Basic classroom info
    name: {
      type: String,
      required: [true, "Classroom name is required"],
      trim: true,
      maxlength: [100, "Classroom name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Subjects taught
    subjects: {
      type: [String],
      required: [true, "At least one subject is required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one subject is required",
      },
    },

    // Target grades/levels
    targetGrades: {
      type: [String],
      default: [],
    },

    // Fee structure
    feeStructure: {
      amount: {
        type: Number,
        required: [true, "Fee amount is required"],
        min: [0, "Fee cannot be negative"],
      },
      period: {
        type: String,
        enum: ["per_session", "weekly", "monthly", "quarterly", "yearly"],
        default: "monthly",
      },
      currency: {
        type: String,
        default: "INR",
      },
      additionalInfo: {
        type: String,
        trim: true,
        maxlength: [500, "Additional fee info cannot exceed 500 characters"],
      },
    },

    // Location details
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      area: {
        type: String,
        required: [true, "Area/Locality is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"],
      },
      landmark: {
        type: String,
        trim: true,
      },
      // Geo coordinates for distance-based search
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },

    // Timing details
    schedule: {
      days: {
        type: [String],
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        required: [true, "At least one day is required"],
      },
      startTime: {
        type: String, // Format: "HH:MM" (24-hour)
        required: [true, "Start time is required"],
      },
      endTime: {
        type: String, // Format: "HH:MM" (24-hour)
        required: [true, "End time is required"],
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
      additionalInfo: {
        type: String,
        trim: true,
        maxlength: [
          500,
          "Additional schedule info cannot exceed 500 characters",
        ],
      },
    },

    // Batch/Capacity info
    batchInfo: {
      maxStudents: {
        type: Number,
        min: [1, "At least 1 student required"],
        default: 10,
      },
      currentStudents: {
        type: Number,
        default: 0,
        min: 0,
      },
      batchType: {
        type: String,
        enum: ["group", "individual", "both"],
        default: "group",
      },
    },

    // Contact information (for direct contact - no platform intermediary)
    contactInfo: {
      phone: {
        type: String,
        required: [true, "Contact phone is required"],
        trim: true,
      },
      whatsapp: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      preferredContact: {
        type: String,
        enum: ["phone", "whatsapp", "email"],
        default: "phone",
      },
    },

    // Facilities provided
    facilities: {
      type: [String],
      default: [],
    },

    // Images of the classroom
    images: {
      type: [String], // Array of image URLs/paths
      default: [],
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "full", "paused"],
      default: "active",
    },

    // Verification status (optional admin verification)
    isVerified: {
      type: Boolean,
      default: false,
    },

    // View/inquiry counts
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      inquiries: {
        type: Number,
        default: 0,
      },
    },

    // SEO-friendly slug
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geo-based search
offlineClassroomSchema.index({ "location.coordinates": "2dsphere" });

// Index for text search
offlineClassroomSchema.index({
  name: "text",
  description: "text",
  subjects: "text",
  "location.area": "text",
  "location.city": "text",
});

// Index for common queries
offlineClassroomSchema.index({ status: 1, "location.city": 1 });
offlineClassroomSchema.index({ tutor: 1 });
offlineClassroomSchema.index({ subjects: 1 });
offlineClassroomSchema.index({ "location.pincode": 1 });

// Generate slug before saving
offlineClassroomSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// Virtual for available seats
offlineClassroomSchema.virtual("availableSeats").get(function () {
  return this.batchInfo.maxStudents - this.batchInfo.currentStudents;
});

// Virtual for formatted fee
offlineClassroomSchema.virtual("formattedFee").get(function () {
  const periodLabels = {
    per_session: "per session",
    weekly: "per week",
    monthly: "per month",
    quarterly: "per quarter",
    yearly: "per year",
  };
  return `₹${
    this.feeStructure.amount
  } ${periodLabels[this.feeStructure.period] || ""}`;
});

// Enable virtuals in JSON
offlineClassroomSchema.set("toJSON", { virtuals: true });
offlineClassroomSchema.set("toObject", { virtuals: true });

const OfflineClassroom = mongoose.model(
  "OfflineClassroom",
  offlineClassroomSchema
);

module.exports = OfflineClassroom;
