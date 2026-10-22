# CampusFix – Smart Campus Issue Resolver 🏛️⚡

> **A Complete, Production-Grade Full-Stack Campus Facility Management, Real-Time Dispatch & Issue Resolution System.**

Built with **React.js, Vite, Tailwind CSS, Node.js, Express.js, PostgreSQL, Prisma ORM, Socket.IO, Recharts, and Cloudinary**.

---

## 🌟 Key Features & User Roles

### 🎓 1. Student Portal
* **Account Auth**: Register, Login, JWT session management, profile & contact info updates.
* **Smart Issue Reporting**:
  * Title & detailed description.
  * Category selection with **Smart Department Recommendation** (e.g. *Air Conditioning → Maintenance Department*).
  * Campus building selector with dynamic floor level resolution.
  * Room & exact location specifications.
  * Priority level selection (`Low`, `Medium`, `High`, `Critical`).
  * Photographic evidence / proof attachment via Cloudinary / local storage.
  * **Automatic Sequential Complaint ID Generator** (e.g. `CFX-2026-0001`, `CFX-2026-0037`).
* **My Complaints Tracking**: Multidimensional search, filter by status, priority, category, building, and date with pagination.
* **Full Audit Timeline**: Complete chronological history with status transitions, technician remarks, and repair photos.
* **Real-time Notifications**: Live Socket.IO updates whenever a task is assigned, updated, or resolved without page reload.
* **Feedback & 5-Star Ratings**: Post-resolution rating and reviews to evaluate maintenance quality.
* **1-Click Issue Reopening**: Reopen unsatisfied repairs with explanatory reason and photos for technician re-examination.

---

### 🔧 2. Maintenance Staff Portal
* **Technician Auth**: Secure login for campus electricians, plumbers, network engineers, HVAC techs, and cleaning supervisors.
* **Assigned Work Orders**: Filter and sort assigned tasks by urgency (`Critical`, `High`, etc.) and campus facility.
* **Work Order Actions**:
  * Accept and transition status (`In Progress`, `On Hold`, `Resolved`, `Closed`).
  * Log progress remarks and diagnostic notes.
  * Upload proof/repair photos.
* **Technician Leaderboard**: Personal resolution count, efficiency percentage, and average student rating.

---

### 🛡️ 3. Campus Administration Portal
* **Dynamic Executive Analytics (PostgreSQL + Prisma Aggregations)**:
  * Total, Pending, In Progress, Resolved, and Critical issue KPI cards.
  * Average Resolution Time in hours dynamically calculated.
  * Recharts Visualizations:
    1. Complaints by Category (Bar chart)
    2. Lifecycle Status breakdown (Donut pie chart)
    3. Monthly submission vs resolution velocity (Area chart)
    4. Issues by Campus Building (Stacked bar chart)
    5. Staff Performance Leaderboard with star ratings
* **Master Complaints Database**: Full multi-filter search, batch actions, and dispatch controls.
* **Smart Technician Dispatch**: Modal displaying technician workload badges (active tickets) and department routing.
* **User Directory Management**: Complete CRUD for students, maintenance staff, and administrators.
* **Department & Facility Management**: Create, update, and monitor campus departments and buildings with floor levels.
* **Student Feedback Dashboard**: Service quality audits and student review sentiment analysis.

---

## 🏗️ System Architecture

```text
React.js (Vite + Tailwind CSS + Recharts)
  │
  ├── Axios REST Client (JWT Interceptor) ──► Express.js REST API (Port 5001)
  │                                                │
  │                                                ├── Auth & Role Middlewares
  │                                                ├── Controllers & Aggregations
  │                                                ├── Multer / Cloudinary Storage
  │                                                └── Prisma ORM ──► PostgreSQL Database (Port 5432)
  │
  └── Socket.IO Client ◄─────────────────────► Socket.IO Server (Real-Time Push)
```

---

## 📂 Project Structure

```text
campusfix/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma     # Complete PostgreSQL schema (Users, Issues, Updates, Notifications, Feedback, etc.)
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.js         # Singleton Prisma client instance
│   │   │   ├── db.js             # PostgreSQL connection & lifecycle management
│   │   │   └── cloudinary.js     # Cloudinary configuration with local fallback
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authenticateUser & authorizeRoles via Prisma
│   │   │   ├── error.js          # Centralized error handler & status mappers
│   │   │   └── upload.js         # Multer disk & Cloudinary image processor
│   │   ├── controllers/
│   │   │   ├── authController.js         # Auth, bcrypt password hashing, token issue
│   │   │   ├── issueController.js        # Complaint CRUD, lifecycle transitions, filtering
│   │   │   ├── userController.js         # User management
│   │   │   ├── staffController.js        # Technician roster & live workload stats
│   │   │   ├── departmentController.js   # Service divisions
│   │   │   ├── buildingController.js     # Campus facilities & floor levels
│   │   │   ├── notificationController.js # In-app notification feeds
│   │   │   ├── feedbackController.js     # 5-star ratings & reviews
│   │   │   ├── dashboardController.js    # Recharts analytics & aggregates
│   │   │   └── uploadController.js       # File upload handler
│   │   ├── routes/                       # Express router mappings
│   │   ├── socket/
│   │   │   └── socketHandler.js          # Socket.IO room subscriptions & real-time broadcasts
│   │   ├── utils/
│   │   │   ├── idGenerator.js            # Sequential CFX-YYYY-XXXX generator
│   │   │   ├── smartAssignment.js        # Smart department routing rules
│   │   │   └── formatHelper.js           # ID / entity serialization helper
│   │   ├── seed.js                       # Comprehensive PostgreSQL database seeder
│   │   ├── app.js                        # Express application configuration
│   │   └── server.js                     # HTTP & Socket.IO server bootstrap
│   ├── .env                              # Environment configuration (DATABASE_URL, JWT, Port)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                   # Modals, Navbar, Stat Cards, Timeline, Badges, etc.
│   │   ├── context/                      # AuthContext, SocketContext, NotificationContext
│   │   ├── pages/                        # Student, Staff, Admin, Reports, Analytics pages
│   │   ├── services/                     # Axios API client modules
│   │   ├── App.jsx                       # Routing & ProtectedRoute boundaries
│   │   └── index.css                     # Tailwind CSS & custom design tokens
│   └── package.json
└── README.md
```

---

## 🗄️ Database Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  password     String
  role         String       @default("student") // student, staff, admin
  phone        String?      @default("")
  studentId    String?      @default("")
  staffId      String?      @default("")
  profileImage String?
  active       Boolean      @default(true)
  departmentId String?
  department   Department?  @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  reportedIssues Issue[]       @relation("ReportedIssues")
  assignedIssues Issue[]       @relation("AssignedIssues")
  issueUpdates   IssueUpdate[]
  notifications  Notification[]
  feedbacks      Feedback[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?  @default("")
  categoryKey String?  @default("")
  active      Boolean  @default(true)
  users       User[]
  issues      Issue[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Building {
  id          String   @id @default(uuid())
  name        String   @unique
  block       String?  @default("")
  floors      String[] @default(["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"])
  description String?  @default("")
  issues      Issue[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Issue {
  id           String        @id @default(uuid())
  complaintId  String        @unique
  title        String
  description  String
  category     String
  priority     String        @default("Medium")
  status       String        @default("Submitted")
  buildingId   String
  building     Building      @relation(fields: [buildingId], references: [id])
  floor        String
  location     String
  imageUrls    String[]      @default([])
  reportedById String
  reportedBy   User          @relation("ReportedIssues", fields: [reportedById], references: [id])
  assignedToId String?
  assignedTo   User?         @relation("AssignedIssues", fields: [assignedToId], references: [id])
  departmentId String?
  department   Department?   @relation(fields: [departmentId], references: [id])
  resolvedAt   DateTime?
  reopenCount  Int           @default(0)
  timeline      IssueUpdate[]
  feedback      Feedback?
  notifications Notification[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model IssueUpdate {
  id             String   @id @default(uuid())
  issueId        String
  issue          Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  updatedById    String
  updatedBy      User     @relation(fields: [updatedById], references: [id], onDelete: Cascade)
  previousStatus String?  @default("")
  newStatus      String?  @default("")
  comment        String?  @default("")
  imageUrl       String?  @default("")
  actionType     String   @default("comment")
  createdAt      DateTime @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  issueId   String?
  issue     Issue?   @relation(fields: [issueId], references: [id], onDelete: SetNull)
  message   String
  type      String   @default("status_update")
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Feedback {
  id        String   @id @default(uuid())
  issueId   String   @unique
  issue     Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  studentId String
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  rating    Int
  comment   String?  @default("")
  createdAt DateTime @default(now())
}
```

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: PostgreSQL 14+ installed and running locally or on a cloud provider (e.g., Supabase, Neon, AWS RDS).

---

### 1. Environment Setup

Inside `backend/.env`:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/campusfix?schema=public
JWT_SECRET=campusfix_jwt_super_secret_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

### 2. Database Sync & Seeding

```bash
# In backend directory:
cd backend

# Generate Prisma Client
npm run prisma:generate

# Push schema directly to PostgreSQL database
npm run prisma:push

# Seed realistic demo data (Admin, 5 Staff, 20 Students, 8 Depts, 6 Buildings, 36 Complaints)
npm run seed
```

---

### 3. Start Development Servers

**Backend (API & WebSockets):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5001
```

**Frontend (Vite Dev Server):**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusfix.edu` | `Campus@123` | Full administrative control, dispatching, and analytics |
| **Electrical Staff** | `electrical.staff@campusfix.edu` | `Campus@123` | Technician for power, wiring, HVAC, and classroom AV |
| **Network Staff** | `network.staff@campusfix.edu` | `Campus@123` | Technician for Wi-Fi APs, lab ethernet, and server switches |
| **Plumbing Staff** | `plumbing.staff@campusfix.edu` | `Campus@123` | Technician for washrooms, water coolers, and drainage |
| **Maintenance Staff**| `maintenance.staff@campusfix.edu` | `Campus@123` | Technician for carpentry, desks, doors, and whiteboards |
| **Cleaning Staff** | `cleaning.staff@campusfix.edu` | `Campus@123` | Housekeeping supervisor for sanitation & waste |
| **Student** | `student@campusfix.edu` | `Campus@123` | Alex Morgan (Reports issues, tracks status, leaves 5-star ratings) |
| **Student 2-20** | `student2@campusfix.edu` - `student20@campusfix.edu` | `Campus@123` | Additional active campus students |

---

## 🛠️ Handy Prisma Commands

* **`npm run prisma:push`**: Push schema changes to your PostgreSQL database.
* **`npm run prisma:generate`**: Re-generate the Prisma Client type definitions.
* **`npm run prisma:studio`**: Open Prisma visual database browser GUI at `http://localhost:5555`.
* **`npm run seed`**: Re-populate the database with demo accounts and complaints.

---

## 🛡️ License

This project is open-source under the **ISC License**.
>>>>>>> db6b4a28 (Initial commit)
