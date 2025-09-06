import api from "./api.service";

class StudentProfileService {
  // Student methods (for students to manage their own profiles)

  /**
   * Get current student's profile
   */
  async getMyProfile() {
    try {
      const response = await api.get("/student-profiles/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update current student's profile
   */
  async updateMyProfile(profileData) {
    try {
      const response = await api.put("/student-profiles/profile", profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tutor methods (for tutors to view student profiles)

  /**
   * Get student profile by ID (tutor access)
   */
  async getStudentProfile(studentId) {
    try {
      const response = await api.get(`/student-profiles/profile/${studentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get student summary (for session cards)
   */
  async getStudentSummary(studentId) {
    try {
      const response = await api.get(`/student-profiles/summary/${studentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all students taught by current tutor
   */
  async getMyStudents() {
    try {
      const response = await api.get("/student-profiles/my-students");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods

  /**
   * Calculate profile completeness percentage
   */
  calculateCompleteness(profile) {
    const requiredFields = [
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

    requiredFields.forEach((field) => {
      const value = profile[field];
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value) && value.length > 0) {
          completedFields++;
        } else if (!Array.isArray(value)) {
          completedFields++;
        }
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Get profile completion suggestions
   */
  getCompletionSuggestions(profile) {
    const suggestions = [];

    if (!profile.bio || profile.bio.trim() === "") {
      suggestions.push(
        "Add a personal bio to help tutors understand you better"
      );
    }

    if (!profile.academicGoals || profile.academicGoals.length === 0) {
      suggestions.push(
        "Add your academic goals to help tutors tailor their teaching"
      );
    }

    if (!profile.learningStyle || profile.learningStyle.length === 0) {
      suggestions.push("Specify your learning style preferences");
    }

    if (!profile.strengths || profile.strengths.length === 0) {
      suggestions.push("List your academic strengths");
    }

    if (
      !profile.areasForImprovement ||
      profile.areasForImprovement.length === 0
    ) {
      suggestions.push("Identify areas where you need help");
    }

    if (!profile.interests || profile.interests.length === 0) {
      suggestions.push("Add your interests and hobbies");
    }

    return suggestions;
  }

  /**
   * Get default profile data structure
   */
  getDefaultProfile() {
    return {
      grade: "",
      academicLevel: "",
      school: "",
      currentGPA: null,
      bio: "",
      subjects: [],
      academicGoals: [],
      strengths: [],
      areasForImprovement: [],
      learningStyle: [],
      studySchedulePreference: "Flexible",
      homeworkHelpNeeds: [],
      examPreparationNeeds: [],
      previousTutoringExperience: false,
      tutoringExperienceDetails: "",
      specialLearningNeeds: "",
      availableStudyTime: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      parentInvolvement: "Medium",
      preferredTeachingMode: ["online_individual"],
      interests: [],
      location: {
        city: "",
        state: "",
        country: "",
      },
    };
  }

  // Error handler
  handleError(error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: "Network error or server is unavailable",
    };
  }
}

export default new StudentProfileService();
