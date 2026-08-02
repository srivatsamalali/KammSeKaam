# Aston Recruitment - Consultancy Management Portal

A modern, responsive, full-stack recruitment and consultancy management portal connecting talent with top-tier opportunities. Built with React, Node.js, Express, and MySQL.

---


## 🎯 Features & Key Functionality

### 👥 Three Specialized Portals

- **Admin Portal**: Create and manage recruiters, view comprehensive candidate application reports, assign candidates to recruiters, and override application status/statuses.
- **Recruiter Portal**: View assigned candidates, schedule interviews with integrated Google Meet & Cal.com links, track candidate progress, and record interview feedback.
- **Candidate Portal**: Register with Phone OTP / Email verification, complete candidate profile (experience, CTC, location preferences), upload resume (PDF), track real-time application status, and view interview details.

---

### ✨ Core System Capabilities

- **🔐 Dual Authentication & Security**: JWT-based role authentication (`ADMIN`, `RECRUITER`, `CANDIDATE`), bcrypt password hashing, phone OTP verification.
- **🔑 Recruiter Password Reset Flow**: Recruiter-only 3-step password reset (Email database verification -> OTP -> Reset password).
- **🗓️ Cal.com & Google Meet Auto-Scheduling**: Auto-generate unique meeting links (Google Meet / Cal.com) when scheduling interviews.
- **📧 Automated Email Notifications**: Dispatches rich HTML interview invitations with complete details (date/time, assigned recruiter, meeting link, candidate guidelines) to candidates with recruiter CC.
- **📄 Resume Management**: Secure PDF resume upload and preview (up to 5MB).
- **📊 Real-time Dashboard Analytics**: Track candidates, recruiters, applications, selections, and rejections.
- **📱 Responsive UI**: High-aesthetic, modern glassmorphism design system built with React, Vite, and TailwindCSS.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: TailwindCSS & Vanilla CSS design system
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **ORM**: Sequelize ORM
- **Database**: MySQL 8.0
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Email Service**: Nodemailer (Gmail SMTP / Custom SMTP)
- **File Storage**: Multer

### Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Reverse Proxy for Production)

---

## 📋 Prerequisites

### Local Development
- **Node.js**: v18 or higher ([Download Node.js](https://nodejs.org/))
- **MySQL**: 8.0 or higher ([Download MySQL](https://dev.mysql.com/downloads/mysql/))
- **Package Manager**: npm or yarn

### Docker Deployment
- **Docker Desktop** ([Download Docker](https://www.docker.com/products/docker-desktop))
- **Docker Compose**

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kaamsekaaam
DB_USER=root
DB_PASSWORD=password

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_aston_recruitment
JWT_EXPIRATION=7d

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=astonrecruitment64@gmail.com
SMTP_PASSWORD=qwbd layp mrzy srci
ADMIN_EMAIL=admin@astonrecruitment.com

# Admin Default Credentials
ADMIN_EMAIL_ENV=admin@kaamsekaaam.com
ADMIN_PASSWORD_ENV=Admin@12345

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Initialize MySQL Database:

```sql
CREATE DATABASE kaamsekaaam;
```

Run Database Seeder (optional sample data):

```bash
npm run seed
```

Start the Backend Server:

```bash
npm start
```

The backend server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173`.

---

### 3. Default Login Credentials

| Role | Email / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kaamsekaaam.com` | `Admin@12345` | Full administrative control |
| **Recruiter** | `adi@gmail.com` | `Recruiter@123` | Assigned candidates & scheduling |
| **Candidate** | Candidate Email / Phone | Registered Password | Profile & application tracking |

---

## 🐳 Docker Deployment

### Run All Services with Docker Compose

To launch MySQL, Backend, and Frontend containers in a production-ready setup:

```bash
docker-compose up --build -d
```

### Services Mapping

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MySQL Database**: `localhost:3306`

### Stop Docker Services

```bash
docker-compose down
```

To remove volumes and reset data:

```bash
docker-compose down -v
```

---

## 📁 Project Structure

```
aston-recruitment/
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/      # Navigation, Headers, Loaders
│   │   ├── context/         # AuthContext state management
│   │   ├── pages/           # Admin, Recruiter, Candidate Dashboards & Logins
│   │   ├── services/        # API Axios service layers
│   │   ├── styles/          # Design system & Tailwind styles
│   │   └── App.jsx          # Route definitions
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── config/          # Database, Email, JWT configurations
│   │   ├── controllers/     # Auth, Admin, Recruiter, Application controllers
│   │   ├── middlewares/     # JWT Auth & Role Authorization middlewares
│   │   ├── models/          # Sequelize models (User, Candidate, Recruiter, Application, Notification)
│   │   ├── routes/          # API route handlers
│   │   ├── utils/           # Email & Token utilities
│   │   └── server.js        # Main Express server entry point
│   ├── scripts/             # Migration & Seeding scripts
│   ├── uploads/             # Resume PDF storage
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml       # Container orchestration configuration
└── README.md                # Project documentation
```

---

## 📚 API Endpoints Overview

### Authentication Routes (`/api/auth`)
- `POST /api/auth/send-otp` - Send OTP for candidate registration / verification
- `POST /api/auth/verify-otp` - Verify phone OTP
- `POST /api/auth/register` - Complete candidate registration
- `POST /api/auth/login` - Login for Admin, Recruiter, and Candidate
- `POST /api/auth/forgot-password` - Trigger Recruiter password reset (DB verified)
- `POST /api/auth/reset-password-otp` - Verify OTP & reset Recruiter password

### Application Routes (`/api/applications`)
- `POST /api/applications/assign` - Assign candidate to recruiter (Admin only)
- `PUT /api/applications/:id/interview` - Schedule interview & send email invite (Recruiter only)
- `PUT /api/applications/:id/status` - Update candidate application status
- `PUT /api/applications/:id/feedback` - Add recruiter interview feedback

### Recruiter Management Routes (`/api/recruiters`)
- `GET /api/recruiters` - List all recruiters with auto-synced profiles (Admin only)
- `POST /api/recruiters` - Create new recruiter account (Admin only)
- `PUT /api/recruiters/:id` - Update recruiter profile (Admin only)
- `DELETE /api/recruiters/:id` - Remove recruiter (Admin only)

### Admin Routes (`/api/admin`)
- `GET /api/admin/dashboard` - Get dashboard stats counters
- `GET /api/admin/reports` - Get all application reports with auto-synced candidate profiles
- `GET /api/admin/unassigned` - Fetch unassigned candidates
- `PUT /api/admin/applications/:id` - Admin override candidate application status

---

## 🔒 Security Practices

- **Role-Based Access Control (RBAC)**: Route-level middleware enforces strict permission boundaries.
- **Prepared Statements**: Sequelize ORM protects against SQL injection vulnerabilities.
- **Secure File Uploads**: File upload validator accepts PDF files up to 5MB max.
- **Cross-Origin Resource Sharing (CORS)**: Strict CORS policies configured.

---

## 📄 License & Copyright

Copyright © 2026 **Aston Recruitment Team**. All rights reserved.
