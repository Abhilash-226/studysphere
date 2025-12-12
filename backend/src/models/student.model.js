const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Basic Information
    grade: {
      type: String,
      trim: true,
    },
    academicLevel: {
      type: String,
      enum: [
        "Elementary School",
        "Middle School",
        "High School",
        "College/University",
        "Graduate School",
        "Professional Development",
      ],
      trim: true,
    },
    school: {
      type: String,
      trim: true,
    },
    currentGPA: {
      type: Number,
      min: 0,
      max: 10.0,
    },

    // Academic Information
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    academicGoals: [
      {
        type: String,
        trim: true,
      },
    ],
    strengths: [
      {
        type: String,
        trim: true,
      },
    ],
    areasForImprovement: [
      {
        type: String,
        trim: true,
      },
    ],

    // Learning Preferences
    learningStyle: [
      {
        type: String,
        enum: ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"],
      },
    ],
    studySchedulePreference: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Flexible"],
      default: "Flexible",
    },
    homeworkHelpNeeds: [
      {
        type: String,
        trim: true,
      },
    ],
    examPreparationNeeds: [
      {
        type: String,
        trim: true,
      },
    ],

    // Background & Context
    previousTutoringExperience: {
      type: Boolean,
      default: false,
    },
    tutoringExperienceDetails: {
      type: String,
      trim: true,
    },
    specialLearningNeeds: {
      type: String,
      trim: true,
    },
    availableStudyTime: {
      type: String,
      enum: [
        "1-2 hours/week",
        "3-5 hours/week",
        "6-10 hours/week",
        "10+ hours/week",
      ],
    },

    // Parent/Guardian Information
    parentName: {
      type: String,
      trim: true,
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
    parentInvolvement: {
      type: String,
      enum: ["High", "Medium", "Low", "Independent"],
      default: "Medium",
    },

    // Location and Preferences
    location: {
      city: String,
      state: String,
      country: String,
      address: String,
      postalCode: String,
      timeZone: String,
    },
    preferredTeachingMode: {
      type: [String],
      enum: [
        "online_individual",
        "online_group",
        "offline_home",
        "offline_classroom",
      ],
      default: ["online_individual"],
    },

    // Profile Metadata
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to calculate profile completeness
studentSchema.methods.calculateProfileCompleteness = function () {
  const fields = [
    "grade",
    "academicLevel",
    "school",
    "subjects",
    "academicGoals",
    "strengths",
    "areasForImprovement",
    "learningStyle",
    "studySchedulePreference",
    "bio",
    "interests",
    "availableStudyTime",
  ];

  let completedFields = 0;
  const totalFields = fields.length;

  fields.forEach((field) => {
    const value = this[field];
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      } else if (!Array.isArray(value)) {
        completedFields++;
      }
    }
  });

  return Math.round((completedFields / totalFields) * 100);
};

// Pre-save hook to update profile completeness
studentSchema.pre("save", function (next) {
  this.profileCompleteness = this.calculateProfileCompleteness();
  next();
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
