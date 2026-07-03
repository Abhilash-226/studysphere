# StudySphere

StudySphere is a premium Full-Stack EdTech marketplace and real-time learning platform designed to connect students with qualified tutors. The platform supports secure online video tutoring sessions, offline physical classroom listings, real-time encrypted messaging, automated double-booking checks, and integrated Razorpay payments.

---

## 🚀 Key Features

- **Tutor Discovery & Filtering**: Advanced search by specialization, teaching mode (online/offline), availability, pricing, rating, and geographic location.
- **Session Booking & Scheduling**: Automated student session booking requests with tutor approval/decline workflows and active conflict checks.
- **Real-Time Cryptographic Chat**: Instantly message other users. Messages are encrypted using `aes-256-cbc` before database persistence and decrypted on-the-fly for clients.
- **Virtual Jitsi Classrooms**: Fully integrated WebRTC-based online classrooms using standard Jitsi Meet or 8x8 Jitsi As A Service (JaaS) with signed JWT authorization.
- **Razorpay Payment Escrow**: Integrates secure payment checkouts with holding/capture mechanisms tied directly to session completion approval.
- **Offline Classrooms Marketplace**: Public marketplace for physical classrooms, equipped with geospatial MongoDB searches and direct communication contact points.
- **Admin Dashboard**: Verification queue for reviewing qualifications and credentials submitted by tutors.

---

## 📁 Project Structure

```
StudySphere/
├── backend/                  # Express.js REST API & WebSocket Server
│   ├── src/
│   │   ├── config/           # Database and upload config
│   │   ├── controllers/      # Route logic (auth, chat, sessions, tutors, classrooms)
│   │   ├── middleware/       # Auth (JWT) & Role-based access control
│   │   ├── models/           # Mongoose schemas (User, Student, Tutor, Session, etc.)
│   │   ├── routes/           # REST endpoints mapping
│   │   ├── services/         # Payments (Razorpay) & Websockets (Socket.IO)
│   │   └── utils/            # AES-256 encryption, JaaS token builders
│   └── server.js             # Main server entrypoint
│
└── frontend/                 # React.js SPA (Vite + BootStrap)
    ├── src/
    │   ├── admin/            # Admin dashboard components and queues
    │   ├── classrooms/       # Live classroom/video page
    │   ├── shared/           # Shared context (Auth), custom hooks, navigation
    │   ├── students/         # Student dashboards and profiles
    │   └── tutors/           # Tutor schedules, dashboard and profile setup
    ├── index.html            # SPA mount
    └── vite.config.js        # Vite configurations
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, React Router DOM, Bootstrap 5, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO, JWT, Cryptographic utilities.
- **Database**: MongoDB + Mongoose ODM (utilizes compound indexes, geospatial searches, and TTL indices).
- **Video Conferencing**: Jitsi Meet WebRTC, 8x8 JaaS.
- **Payments**: Razorpay Gateway API.

---

## ⚙️ Local Setup & Configuration

### Prerequisites
- Node.js (v16+)
- npm (v7+)
- MongoDB instance (local or Atlas)

### 1. Configure the Backend

Navigate to the `backend/` directory:
```bash
cd backend
```

Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:25017/studysphere
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h
MESSAGE_ENCRYPTION_KEY=00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff

# Razorpay Config (Use test credentials for development)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PAYMENT_MODE=development # development | test | live

# Jitsi as a Service Config (Optional)
JAAS_APP_ID=your_jaas_app_id
JAAS_KEY_ID=your_jaas_key_id
JAAS_PRIVATE_KEY=your_jaas_rsa_private_key
```

Install backend dependencies:
```bash
npm install
```

### 2. Configure the Frontend

Navigate to the `frontend/` directory:
```bash
cd ../frontend
```

Create a `.env` file based on `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install frontend dependencies:
```bash
npm install
```

---

## 🏃 Running the Application

To start both servers locally:

### Start Backend
In the `backend/` directory:
```bash
npm run dev
# or
node server.js
```
The backend API server will run at `http://localhost:5000`.

### Start Frontend
In the `frontend/` directory:
```bash
npm run dev
```
The React development server will start (typically at `http://localhost:5173` or `http://localhost:3000`). Open this URL in your web browser.

---

## 🔒 Security & Best Practices

- **Password Hashing**: Salts and hashes passwords before db storage via Mongoose `pre-save` hooks.
- **Encrypted Database Entries**: All message logs are encrypted inside the database via AES-256.
- **Role Isolation**: Express middlewares restrict student-only, tutor-only, and admin-only REST routes.
- **Auto-Expiry**: Pending scheduling requests expire automatically after 48 hours using MongoDB TTL index handlers.
