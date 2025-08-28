// Database configuration
module.exports = {
  // MongoDB connection parameters
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Indexes can be added here based on queries that will be frequently used
  },

  // Database collections
  collections: {
    users: "users",
    tutors: "tutors",
    students: "students",
    sessions: "sessions",
    reviews: "reviews",
    payments: "payments",
  },
};
