// Enhanced formatUserData implementation
const formatUserData = async (user, conversation = null) => {
  if (!user) return { name: "Unknown User", role: "unknown" };

  let name = null;
  let email = user.email || "No email";
  let profileImage = user.profileImage || "";
  let role = user.role || "unknown";

  // Direct approach: Try to get the full user data with a single query
  try {
    const fullUserData = await User.findById(user._id)
      .select("firstName lastName email profileImage role")
      .lean();

    if (fullUserData) {
      // Update with the most current data
      email = fullUserData.email || email;
      profileImage = fullUserData.profileImage || profileImage;
      role = fullUserData.role || role;

      // Check for valid first and last name
      if (
        fullUserData.firstName &&
        fullUserData.lastName &&
        fullUserData.firstName.trim() !== "" &&
        fullUserData.lastName.trim() !== ""
      ) {
        name = `${fullUserData.firstName} ${fullUserData.lastName}`.trim();
      }
    }
  } catch (err) {
    console.error("Error fetching complete user data:", err);
  }

  // If we still don't have a name, try role-specific lookup
  if (!name) {
    if (role === "tutor") {
      try {
        const tutorWithUser = await Tutor.findOne({ user: user._id })
          .populate("user", "firstName lastName email profileImage")
          .lean();

        if (tutorWithUser && tutorWithUser.user) {
          const tutorUser = tutorWithUser.user;
          if (tutorUser.firstName && tutorUser.lastName) {
            name = `${tutorUser.firstName} ${tutorUser.lastName}`.trim();
          }
          email = tutorUser.email || email;
          profileImage = tutorUser.profileImage || profileImage;
        }
      } catch (err) {
        console.error("Error in tutor lookup:", err);
      }
    } else if (role === "student") {
      try {
        const studentWithUser = await Student.findOne({ user: user._id })
          .populate("user", "firstName lastName email profileImage")
          .lean();

        if (studentWithUser && studentWithUser.user) {
          const studentUser = studentWithUser.user;
          if (studentUser.firstName && studentUser.lastName) {
            name = `${studentUser.firstName} ${studentUser.lastName}`.trim();
          }
          email = studentUser.email || email;
          profileImage = studentUser.profileImage || profileImage;
        }
      } catch (err) {
        console.error("Error in student lookup:", err);
      }
    }
  }

  // Final fallback - create a readable name from email or ID
  if (!name || name === "Unknown User") {
    if (email && email !== "No email" && email.includes("@")) {
      // Extract name from email
      const emailPrefix = email.split("@")[0];
      if (emailPrefix.includes(".")) {
        const parts = emailPrefix.split(".");
        name = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${
          parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        }`;
      } else {
        name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
    } else {
      // Use ID suffix as last resort
      const idSuffix = user._id.toString().slice(-4);
      name = `${role === "tutor" ? "Tutor" : "Student"} ${idSuffix}`;
    }
  }

  return {
    id: user._id,
    name: name,
    profileImage: profileImage,
    email: email,
    role: role,
  };
};

module.exports = formatUserData;
