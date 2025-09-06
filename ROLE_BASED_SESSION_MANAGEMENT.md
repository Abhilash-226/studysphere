# Session Management System - Role-Based Organization

## Overview

The session management system has been properly organized according to the existing StudySphere folder structure, with role-specific components for students and tutors, and shared components for common functionality.

## Updated Folder Structure

```
frontend/src/
├── shared/
│   ├── components/
│   │   └── Modals/
│   │       └── SessionBooking/
│   │           ├── SessionBookingModal.jsx
│   │           └── SessionBookingModal.css
│   └── services/
│       └── sessionService.js
├── students/
│   └── pages/
│       └── Dashboard/
│           └── components/
│               ├── SessionManagement/
│               │   ├── StudentSessionManagement.jsx
│               │   ├── StudentSessionManagement.css
│               │   ├── StudentSessionCard.jsx
│               │   └── StudentSessionCard.css
│               └── index.js (updated)
└── tutors/
    └── pages/
        └── Dashboard/
            └── components/
                ├── SessionManagement/
                │   ├── TutorSessionManagement.jsx
                │   ├── TutorSessionManagement.css
                │   ├── TutorSessionCard.jsx
                │   └── TutorSessionCard.css
                └── index.js (updated)
```

## Components Overview

### Shared Components

#### SessionBookingModal

- **Location**: `shared/components/Modals/SessionBooking/`
- **Purpose**: Reusable booking modal for all session booking scenarios
- **Features**: Tutor selection, date/time picker, mode selection, price calculation

### Student Components

#### StudentSessionManagement

- **Location**: `students/pages/Dashboard/components/SessionManagement/`
- **Purpose**: Main session dashboard for students
- **Features**:
  - Statistics cards (Total, Upcoming, Completed, Total Spent)
  - Tabbed interface for different session states
  - "Book New Session" functionality
  - Integration with SessionBookingModal

#### StudentSessionCard

- **Purpose**: Individual session display for students
- **Features**:
  - Tutor information display
  - Session details and timing
  - Student-specific actions (Cancel, Rate & Review)
  - Join session button

### Tutor Components

#### TutorSessionManagement

- **Location**: `tutors/pages/Dashboard/components/SessionManagement/`
- **Purpose**: Main session dashboard for tutors
- **Features**:
  - Statistics cards (Total, Upcoming, Total Earnings, Average Rating)
  - Today's sessions alert
  - Tabbed interface for session management
  - Teaching-focused analytics

#### TutorSessionCard

- **Purpose**: Individual session display for tutors
- **Features**:
  - Student information display
  - Session details and timing
  - Tutor-specific actions (Cancel, Complete, Reschedule)
  - Start session button

## Integration Examples

### Adding to Student Dashboard

```jsx
// students/pages/Dashboard/StudentDashboard.jsx
import React from "react";
import { StudentSessionManagement } from "./components";

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      {/* Other dashboard components */}

      {/* Session Management Section */}
      <section className="mb-5">
        <StudentSessionManagement
          onBookSession={(tutor) => {
            // Handle book session callback
            console.log("Booking session with:", tutor);
          }}
        />
      </section>
    </div>
  );
};
```

### Adding to Tutor Dashboard

```jsx
// tutors/pages/Dashboard/TutorDashboard.jsx
import React from "react";
import { TutorSessionManagement } from "./components";

const TutorDashboard = () => {
  return (
    <div className="tutor-dashboard">
      {/* Other dashboard components */}

      {/* Session Management Section */}
      <section className="mb-5">
        <TutorSessionManagement />
      </section>
    </div>
  );
};
```

### Using Session Booking Modal in Tutor Cards

```jsx
// Any component that needs to book sessions
import React, { useState } from "react";
import SessionBookingModal from "../../../shared/components/Modals/SessionBooking/SessionBookingModal";

const TutorCard = ({ tutor }) => {
  const [showBooking, setShowBooking] = useState(false);

  const handleBookingSuccess = (sessionData) => {
    console.log("Session booked successfully:", sessionData);
    setShowBooking(false);
    // Refresh data or show success message
  };

  return (
    <div className="tutor-card">
      <button onClick={() => setShowBooking(true)}>Book Session</button>

      <SessionBookingModal
        show={showBooking}
        onHide={() => setShowBooking(false)}
        tutor={tutor}
        onSuccess={handleBookingSuccess}
        onError={(error) => console.error("Booking failed:", error)}
      />
    </div>
  );
};
```

## Key Features by Role

### Student Features

- ✅ Book sessions with tutors
- ✅ View upcoming, completed, and cancelled sessions
- ✅ Cancel scheduled sessions with reason
- ✅ Rate and review completed sessions
- ✅ Track total spending on sessions
- ✅ Join online sessions

### Tutor Features

- ✅ View teaching schedule and student information
- ✅ Complete sessions with notes
- ✅ Cancel sessions with reason
- ✅ Reschedule sessions
- ✅ Track total earnings and average rating
- ✅ Today's sessions notifications
- ✅ Start online sessions

### Shared Features

- ✅ Real-time session status updates
- ✅ Responsive design for mobile devices
- ✅ Professional UI with consistent styling
- ✅ Comprehensive error handling
- ✅ Role-based access control

## API Integration

All components use the shared `sessionService` which provides:

- Session CRUD operations
- Statistics and analytics
- Availability checking
- Error handling and data formatting

## Styling

Each component has its own CSS file with:

- Consistent color schemes
- Responsive breakpoints
- Professional card designs
- Interactive hover effects
- Status-based styling

## Benefits of This Organization

1. **Role Separation**: Students and tutors have tailored experiences
2. **Code Reusability**: Shared components can be used across roles
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new features for specific roles
5. **Consistency**: Follows existing project structure patterns

This organization maintains the existing StudySphere architecture while providing comprehensive session management functionality for both students and tutors.
