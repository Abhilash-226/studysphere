// Enhanced formatter function for consistent user data
const formatUserData = async (user, conversation = null) => {
  if (!user) return { name: "Unknown User", role: "unknown" };

  // Define defaults
  let name = null;
  let email = user.email || "No email";
  let profileImage = user.profileImage || "";
  let role = user.role || "unknown";

  console.log(`Formatting user data for: ${user._id}, role: ${role}`);

  // We'll try multiple approaches to get the best user data

  // Step 1: First attempt - Get directly from the User model
  try {
    console.log(`Looking up user ${user._id} in User collection`);
    const fullUserData = await User.findById(user._id)
      .select("firstName lastName email profileImage role")
      .lean();

    if (fullUserData) {
      console.log(
        `Found user data for ${user._id}: ${fullUserData.firstName} ${fullUserData.lastName}`
      );
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
        console.log(`User ${user._id} name set to: ${name}`);
      } else {
        console.log(`User ${user._id} has invalid name fields`);
      }
    }
  } catch (err) {
    console.error(`Error fetching user data for ${user._id}:`, err);
  }

  // Step 2: If name is still missing, try role-specific collections
  if (!name) {
    console.log(
      `Name not found for ${user._id}, trying role-specific lookup for ${role}`
    );

    if (role === "tutor") {
      try {
        const tutorRecord = await Tutor.findOne({ user: user._id }).lean();

        if (tutorRecord) {
          console.log(`Found tutor record for ${user._id}`);
          // Direct lookup from user collection once we confirmed this is a tutor
          const tutorUser = await User.findById(user._id)
            .select("firstName lastName email")
            .lean();

          if (tutorUser) {
            if (tutorUser.firstName && tutorUser.lastName) {
              name = `${tutorUser.firstName} ${tutorUser.lastName}`.trim();
              console.log(`Set tutor ${user._id} name to: ${name}`);
            }
            email = tutorUser.email || email;
          }
        }
      } catch (err) {
        console.error(`Error in tutor lookup for ${user._id}:`, err);
      }
    } else if (role === "student") {
      try {
        const studentRecord = await Student.findOne({ user: user._id }).lean();

        if (studentRecord) {
          console.log(`Found student record for ${user._id}`);
          // Direct lookup from user collection once we confirmed this is a student
          const studentUser = await User.findById(user._id)
            .select("firstName lastName email")
            .lean();

          if (studentUser) {
            if (studentUser.firstName && studentUser.lastName) {
              name = `${studentUser.firstName} ${studentUser.lastName}`.trim();
              console.log(`Set student ${user._id} name to: ${name}`);
            }
            email = studentUser.email || email;
          }
        }
      } catch (err) {
        console.error(`Error in student lookup for ${user._id}:`, err);
      }
    }
  }

  // Step 3: Final fallback - create a readable name from email or ID
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
      console.log(`Generated name from email for ${user._id}: ${name}`);
    } else {
      // Use ID suffix as last resort
      const idSuffix = user._id.toString().slice(-4);
      name = `${role.charAt(0).toUpperCase() + role.slice(1)} ${idSuffix}`;
      console.log(`Generated fallback name for ${user._id}: ${name}`);
    }
  }

  // Return the consistently formatted user data
  return {
    id: user._id,
    name: name,
    profileImage: profileImage,
    email: email,
    role: role,
  };
};
