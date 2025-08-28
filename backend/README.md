# StudySphere Backend

This directory contains the backend API for the StudySphere tutoring platform.

## Directory Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic services
│   └── utils/         # Utility functions
├── uploads/           # Uploaded files
│   ├── documents/     # ID and qualification documents
│   └── profileImages/ # User profile images
├── tests/             # Test files
├── .env               # Environment variables (create from .env.example)
├── .env.example       # Example environment variables
├── package.json       # Project dependencies and scripts
└── server.js          # Entry point for the application
```

## Getting Started

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies: `npm install`
4. Create `.env` file from `.env.example` and update values
5. Run the development server: `npm run dev`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

### Tutor Management

- `GET /api/tutors` - Get all tutors
- `GET /api/tutors/:id` - Get tutor by ID
- `GET /api/tutors/profile` - Get tutor profile (authenticated tutor)
- `PUT /api/tutors/profile` - Update tutor profile

### Student Management

- `GET /api/students/profile` - Get student profile (authenticated student)
- `PUT /api/students/profile` - Update student profile

### Session Management

- `POST /api/sessions` - Create a new session
- `GET /api/sessions` - Get all sessions for current user
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id` - Update session
- `PUT /api/sessions/:id/cancel` - Cancel session
- `PUT /api/sessions/:id/reschedule` - Reschedule session
- `PUT /api/sessions/:id/complete` - Complete session (tutor only)
- `POST /api/sessions/:id/review` - Add review for session (student only)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the JWT token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <token>
```

## File Uploads

- ID documents: `POST /api/auth/upload-id`
- Qualification documents: `POST /api/auth/upload-qualification`
- Profile images: `POST /api/users/upload-profile-image`
- Session attachments: `POST /api/sessions/:id/attachments`

## Testing

Run tests with: `npm test`
