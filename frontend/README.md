# StudySphere 📚
### Full-Stack EdTech Marketplace — Connecting Students with Tutors & Coaching Centers

StudySphere is a production-grade full-stack EdTech marketplace that bridges the gap
between school students seeking academic help and tutors/coaching centers offering
personalized instruction — online and offline, 1:1 and group.

---

## 🚀 Live Demo

**[https://studysphere-frontend-gtvp.onrender.com](https://studysphere-frontend-gtvp.onrender.com)**

> Supports two roles — sign up as a **Student/Parent** to find tutors, or as a **Tutor** to start teaching.

---

## ✨ Features

### For Students & Parents
- **Find Tutors** — Search and filter tutors by subject, class level, learning format (1:1, group, live, recorded, self-paced)
- **Find Classrooms** — Discover offline coaching centers near you with city filter and keyword search
- **Classroom Details** — View batch type, location, timings, capacity, subjects, and monthly fees
- **Book Demo Classes** — Request a free demo session before committing to regular classes
- **Secure Payments** — Pay and enroll through StudySphere SecurePay (Razorpay integration)
- **Real-Time Chat** — Communicate directly with tutors via encrypted messaging

### For Tutors & Educators
- **Create Teaching Profile** — Set up subject expertise, availability, pricing, and learning formats
- **Run Group Batches** — Create and manage classroom batches with defined schedules and capacities
- **Demo Class Flow** — Accept demo requests, conduct live sessions, convert to paid enrollments
- **Earn & Withdraw** — Track sessions and earnings through the tutor dashboard

---

## 🏗️ System Architecture

```
+----------------------------------------------------------+
|                     React Frontend                        |
|              (Student Portal | Tutor Portal)              |
+--------+-----------------+------------------+------------+
         |                 |                  |
   HTTP REST          Socket.IO           WebRTC Sig
   & Razorpay      (Real-time Chat)     (Jitsi/JaaS)
         |                 |                  |
+--------+-----------------+------------------+------------+
|                   Node.js + Express                       |
|              (REST API + WebSocket Server)                 |
+--------+-----------------+---------------------------------+
         |                 |
     Mongoose          Nodemailer
     (MongoDB)          (SMTP OTP)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Bootstrap 5, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Real-Time | Socket.IO (bidirectional chat) |
| Video Classroom | WebRTC via Jitsi Meet / 8x8 JaaS (RS256 JWT) |
| Payments | Razorpay (escrow-style authorize + capture) |
| Auth | JWT + bcryptjs + OTP email verification |
| Encryption | AES-256-CBC (chat message persistence) |
| Deployment | Render |

---

## 🔐 Security Implementation

| Feature | Implementation |
|---|---|
| Authentication | JWT tokens verified on both REST and WebSocket layers |
| Password Storage | bcryptjs with salt round 10 via Mongoose pre-save hook |
| Chat Privacy | AES-256-CBC encrypted before MongoDB storage; decrypted server-side before broadcast |
| Payment Verification | HMAC-SHA256 signature matching on Razorpay webhook |
| Role Separation | Custom middleware: `isTutor`, `isStudent`, `isAdmin` on every protected route |
| OTP Verification | 6-digit OTP sent via SMTP for email verification on signup |
| Video Access | RS256-signed JWTs assign moderator (tutor) vs viewer (student) roles in JaaS |

---

## ⚙️ Key Engineering Highlights

- **Dual-role architecture** — Entirely separate flows, dashboards, and route guards for Students and Tutors
- **Double-booking prevention** — MongoDB time-range overlap queries block conflicting session bookings at the database layer
- **Encrypted chat** — Messages encrypted with AES-256-CBC before persistence; decrypted on-the-fly for active socket clients
- **Escrow payments** — Razorpay funds authorized at booking, captured only after tutor submits completion and student approves
- **Geospatial discovery** — MongoDB `2dsphere` index enables location-based offline classroom search
- **TTL indexes** — Session requests auto-expire using MongoDB `expireAfterSeconds: 0` — no manual cleanup needed
- **Compound unique index** — Conversation participants array sorted and indexed to enforce singular chat rooms between user pairs

---

## 📁 Project Structure

```
studysphere/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── students/          # Student pages and components
│       ├── tutors/            # Tutor pages and components
│       ├── shared/            # AuthContext, ProtectedRoute, Layout
│       └── App.jsx
│
└── backend/                   # Node.js + Express API
    └── src/
        ├── controllers/       # auth, tutor, session, chat, payment, classroom
        ├── models/            # User, Student, Tutor, Session, Message, Payment
        ├── routes/            # /api/auth, /api/tutors, /api/sessions, /api/chat
        ├── middleware/        # auth.middleware, role.middleware
        ├── services/          # websocket.service, email.service
        └── server.js
```

---

## ⚙️ Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env      # Fill in your credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Add your backend API URL
npm run dev
```

### Environment Variables

**Backend `.env`**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JAAS_APP_ID=your_jaas_app_id
JAAS_PRIVATE_KEY=your_jaas_private_key
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

## 🔄 Complete User Journey

```
1. Signup + OTP Email Verification
        ↓
2. Profile Setup (Student or Tutor)
        ↓
3. Tutor Discovery (Search + Filters)
        ↓
4. Book Demo Class → Tutor Accepts
        ↓
5. Live Demo via Jitsi WebRTC Classroom
        ↓
6. Pay via Razorpay → Enrollment Confirmed
        ↓
7. Regular Sessions + Real-time Chat
        ↓
8. Session Complete → Payment Captured → Student Reviews Tutor
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + JWT |
| POST | `/api/auth/verify-otp` | Email OTP verification |
| GET | `/api/tutors` | Search and filter tutors |
| POST | `/api/session-requests` | Book a session |
| PATCH | `/api/session-requests/:id/accept` | Tutor accepts booking |
| POST | `/api/payments/verify` | Verify Razorpay payment |
| POST | `/api/classroom/start/:id` | Start virtual classroom |
| GET | `/api/classroom/join/:id` | Join virtual classroom |

---

## 📊 Platform Highlights

- **End-to-end encrypted** real-time chat using AES-256-CBC
- **WebRTC virtual classrooms** with role-based moderator control via JaaS JWT
- **Geospatial search** for offline coaching centers using MongoDB 2dsphere indexes
- **Dual-role marketplace** supporting individual tutors and coaching center operators
- **Escrow payment flow** protecting both students and tutors through Razorpay

---

## 👨‍💻 Author

**Abhilash Ashadapu**

[GitHub] (https://github.com/Abhilash-226)

---

## 📄 License

This project is for educational and portfolio purposes.
