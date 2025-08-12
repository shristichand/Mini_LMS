Mini LMS is a full-stack Learning Management System built with React frontend and Node.js backend, featuring user authentication, course management, lesson delivery, and progress tracking capabilities.

Project Type: Full-stack web application
Architecture: Monorepo with separate frontend and backend
Technology Stack: React + Node.js + PostgreSQL
Current Version: 1.0.0

Setup Instructions
Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn package manager

Environment Variables

#### Backend (.env)
```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/mini_lms
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Installation & Setup

#### Backend Setup
```bash
cd backend
npm install
npm run migration:generate
npm run migration:run
npm run seed
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# Generate migration
npm run migration:generate

# Run migrations
npm run migration:run

# Revert migration if needed
npm run migration:revert

# Seed database
npm run seed
```
