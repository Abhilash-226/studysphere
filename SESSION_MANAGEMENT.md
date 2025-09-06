# Session Management System

This document provides comprehensive documentation for the StudySphere session booking and management system.

## Overview

The session management system allows students to book tutoring sessions with tutors and provides both parties with tools to manage their sessions effectively. The system includes:

- **Session Booking**: Students can book sessions with tutors
- **Session Dashboard**: Both students and tutors can view and manage their sessions
- **Session Status Tracking**: Complete lifecycle management (scheduled → completed/cancelled)
- **Reviews and Ratings**: Students can review completed sessions
- **Availability Checking**: Prevent double-booking and conflicts

## Architecture

### Backend Components

#### Models

- **Session Model** (`backend/src/models/session.model.js`)
  - Core session data structure
  - Relationships to Student, Tutor, and User models
  - Status tracking and audit fields

#### Controllers

- **Session Controller** (`backend/src/controllers/session.controller.js`)
  - `createSession` - Create new session booking
  - `getAllSessions` - Get sessions for current user with filtering
  - `getSessionById` - Get single session details
  - `cancelSession` - Cancel a scheduled session
  - `completeSession` - Mark session as completed (tutor only)
  - `addSessionReview` - Add rating/review (student only)
  - `getSessionStatistics` - Get user's session stats
  - `checkTutorAvailability` - Check if tutor is available
  - `getAvailableTimeSlots` - Get available time slots for a date
  - `rescheduleSession` - Reschedule an existing session

#### Routes

- **Session Routes** (`backend/src/routes/session.routes.js`)
  - RESTful API endpoints with proper authentication and authorization
  - Role-based access control (student/tutor specific operations)

### Frontend Components

#### Booking System

- **SessionBookingModal** (`frontend/src/shared/components/Sessions/BookingModal/`)
  - Comprehensive booking form with validation
  - Tutor information display
  - Date/time selection with conflict checking
  - Online/offline mode selection
  - Price calculation and display

#### Dashboard System

- **SessionDashboard** (`frontend/src/shared/components/Sessions/Dashboard/`)

  - Statistics overview (total, scheduled, completed, cancelled sessions)
  - Tabbed interface for different session states
  - Pagination support for large session lists
  - Role-based functionality (different views for students vs tutors)

- **SessionCard** (`frontend/src/shared/components/Sessions/Dashboard/`)
  - Individual session display component
  - Action buttons based on session status and user role
  - Modal dialogs for cancellation, completion, and reviews
  - Responsive design for mobile devices

#### Services

- **SessionService** (`frontend/src/shared/services/sessionService.js`)
  - Complete API integration layer
  - Error handling and data formatting
  - Utility functions for session management

## API Endpoints

### Authentication

All endpoints require authentication via `Authorization: Bearer <token>` header.

### Session Management

#### Create Session

```
POST /api/sessions
```

**Role**: Student only
**Body**:

```json
{
  "tutorId": "string",
  "subject": "string",
  "title": "string",
  "description": "string",
  "startTime": "ISO date string",
  "endTime": "ISO date string",
  "mode": "online|offline",
  "location": "string (for offline sessions)"
}
```

#### Get Sessions

```
GET /api/sessions?status=scheduled&page=1&limit=10
```

**Query Parameters**:

- `status`: Filter by status (scheduled, completed, cancelled, rescheduled)
- `page`: Page number for pagination
- `limit`: Items per page
- `subject`: Filter by subject
- `startDate`: Filter sessions starting from this date
- `endDate`: Filter sessions ending before this date

#### Get Session by ID

```
GET /api/sessions/:id
```

#### Cancel Session

```
PATCH /api/sessions/:id/cancel
```

**Body**:

```json
{
  "reason": "string"
}
```

#### Complete Session

```
PATCH /api/sessions/:id/complete
```

**Role**: Tutor only
**Body**:

```json
{
  "notes": "string (optional)"
}
```

#### Add Review

```
PATCH /api/sessions/:id/review
```

**Role**: Student only
**Body**:

```json
{
  "rating": "number (1-5)",
  "review": "string (optional)"
}
```

#### Get Statistics

```
GET /api/sessions/statistics
```

**Response**:

```json
{
  "total": "number",
  "scheduled": "number",
  "completed": "number",
  "cancelled": "number",
  "totalAmount": "number",
  "averageRating": "number (for tutors)"
}
```

#### Check Availability

```
POST /api/sessions/check-availability
```

**Body**:

```json
{
  "tutorId": "string",
  "startTime": "ISO date string",
  "endTime": "ISO date string"
}
```

#### Get Available Time Slots

```
GET /api/sessions/available-slots/:tutorId?date=YYYY-MM-DD
```

#### Reschedule Session

```
PATCH /api/sessions/:id/reschedule
```

**Body**:

```json
{
  "newStartTime": "ISO date string",
  "newEndTime": "ISO date string",
  "reason": "string (optional)"
}
```

## Usage Examples

### Integrating Session Booking

To add session booking to a tutor card or profile:

```jsx
import SessionBookingModal from "../shared/components/Sessions/BookingModal/SessionBookingModal";

const TutorCard = ({ tutor }) => {
  const [showBooking, setShowBooking] = useState(false);

  const handleBookSuccess = (sessionData) => {
    // Handle successful booking
    console.log("Session booked:", sessionData);
    setShowBooking(false);
  };

  return (
    <div>
      <Button onClick={() => setShowBooking(true)}>Book Session</Button>

      <SessionBookingModal
        show={showBooking}
        onHide={() => setShowBooking(false)}
        tutor={tutor}
        onSuccess={handleBookSuccess}
        onError={(error) => console.error(error)}
      />
    </div>
  );
};
```

### Adding Session Dashboard

To add the session dashboard to a user's profile or dedicated page:

```jsx
import SessionDashboard from "../shared/components/Sessions/Dashboard/SessionDashboard";

const UserProfile = () => {
  return (
    <div>
      <h2>My Sessions</h2>
      <SessionDashboard />
    </div>
  );
};
```

### Using Session Service

To interact with the session API directly:

```jsx
import sessionService from "../shared/services/sessionService";

// Get user's sessions
const sessions = await sessionService.getSessions({
  status: "scheduled",
  page: 1,
  limit: 10,
});

// Book a new session
const newSession = await sessionService.createSession({
  tutorId: "tutor123",
  subject: "Mathematics",
  title: "Algebra Help",
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  mode: "online",
});

// Cancel a session
await sessionService.cancelSession("session123", "Scheduling conflict");
```

## Session Status Lifecycle

1. **Scheduled** - Initial state when session is booked
2. **Rescheduled** - Session time has been changed
3. **Completed** - Session has been marked complete by tutor
4. **Cancelled** - Session has been cancelled by student or tutor

## User Permissions

### Students Can:

- Book new sessions with tutors
- View their own sessions
- Cancel their scheduled sessions
- Review completed sessions
- Reschedule their sessions

### Tutors Can:

- View their teaching sessions
- Complete scheduled sessions
- Cancel their sessions
- Reschedule their sessions
- View session statistics and earnings

## Database Schema

### Session Model Fields

```javascript
{
  student: ObjectId (ref: Student),
  tutor: ObjectId (ref: Tutor),
  subject: String,
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  status: String (scheduled|completed|cancelled|rescheduled),
  mode: String (online|offline),
  meetingLink: String,
  location: String,
  price: Number,
  rating: Number (1-5),
  review: String,
  reviewedBy: ObjectId (ref: User),
  cancelReason: String,
  cancelledBy: ObjectId (ref: User),
  cancelledAt: Date,
  completedAt: Date,
  completionNotes: String,
  reviewedAt: Date,
  rescheduleReason: String,
  rescheduledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Input validation with clear error messages
- **Authorization Errors**: Role-based access control
- **Conflict Errors**: Preventing double-booking and scheduling conflicts
- **Network Errors**: Proper handling of connection issues
- **Server Errors**: Graceful degradation and user feedback

## Testing

To test the session management system:

1. **Backend Testing**: Use the test file `backend/tests/session-test.js`
2. **Frontend Testing**: Use the integration example in `SessionIntegrationExample.jsx`
3. **API Testing**: Use tools like Postman or curl to test API endpoints

## Maintenance

### Adding New Features

1. **Backend**: Add new controller methods and routes
2. **Frontend**: Extend components or create new ones
3. **Database**: Update the session model schema if needed

### Common Customizations

- **Pricing Logic**: Modify price calculation in booking modal
- **Availability Rules**: Update availability checking logic
- **Notification System**: Add email/SMS notifications for session events
- **Payment Integration**: Add payment processing to session creation

## Security Considerations

- All endpoints require authentication
- Role-based access control prevents unauthorized actions
- Input validation prevents injection attacks
- Session data is properly sanitized
- User permissions are checked at every operation

This session management system provides a complete solution for tutoring session booking and management while maintaining flexibility for future enhancements and customizations.
