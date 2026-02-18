# Online Voting System

A production-ready, highly secure Online Voting System built with the MERN stack, Socket.io for real-time updates, and Tailwind CSS for a premium UI.

## Features

- **🛡️ Secure Authentication**: JWT-based login sessions with bcrypt password hashing.
- **📱 Phone Verification**: Mandatory OTP verification via Twilio (with development logging mode).
- **🎭 Role-Based Access**: Separate dashboards and permissions for Admins and Voters.
- **⚡ Real-time Results**: Instant vote count updates using Socket.io and interactive Chart.js visualizations.
- **📊 Admin Control Panel**: Create elections, manage candidates, and monitor live voting statistics.
- **🎨 Premium UI**: Responsive design with glassmorphism, smooth animations, and Lucide icons.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Context API, Socket.io-client, Chart.js, React Router.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, Twilio.

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project root.

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   - Configure `.env` file in the `backend` folder:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/online_voting
     JWT_SECRET=your_jwt_secret
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=your_phone
     NODE_ENV=development
     ```
     *Note: In `development` mode, OTP codes are logged to the console.*

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   - Configure `.env` file in the `frontend` folder:
     ```env
     VITE_API_URL=http://localhost:5000/api
     VITE_SOCKET_URL=http://localhost:5000
     ```

### Running the App

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Dummy Data Setup

1. Register an account with `role: "admin"` in the registration form (you can modify the code or DB to grant admin rights to your first user).
2. Create an election in the Admin Dashboard.
3. Add candidates to the election.
4. Set election status to "Active".
5. Start voting!

## Security Measures

- **Double Voting Prevention**: Checked by both user `hasVoted` flag and database validation.
- **OTP Rate Limiting**: Managed by OTP expiry and deletion on verification.
- **Protected Routes**: Middleware verifies JWT and roles for sensitive API/React routes.
- **Input Validation**: Mongoose schemas and frontend forms validate data integrity.

## Deployment

- **Backend**: Can be deployed to Heroku, Render, or any VPS.
- **Frontend**: Can be deployed to Vercel, Netlify, or AWS S3.
- Ensure `MONGO_URI` is set to an Atlas cluster and `NODE_ENV` to `production`.
