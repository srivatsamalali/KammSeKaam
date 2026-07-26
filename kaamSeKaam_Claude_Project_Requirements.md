# kaamSeKaam - Consultancy Management Portal
## Complete Project Requirements for Claude

# Project Overview

Build a modern, responsive, full-stack consultancy management portal named **kaamSeKaam**.

The application should have three separate portals:

1. Admin Portal
2. Recruiter Portal
3. Candidate Portal

The UI should be clean, minimal, professional, responsive, and light themed.

The project should be production-ready so it can later be deployed on any VPS or shared hosting.

---

# Technology Stack

Use the following stack:

Frontend
- React.js
- Vite
- React Router
- TailwindCSS
- React Hook Form
- Axios

Backend
- Node.js
- Express.js

Database
- MySQL

Authentication
- JWT Authentication
- Password Hashing using bcrypt

Email
- Nodemailer (SMTP)

Validation
- Express Validator
- Client-side validation

File Structure
Use scalable folder structure following MVC architecture.

---

# Branding

Website Name

# kaamSeKaam

Theme

- White
- Light Gray
- Blue accents

Landing Page

Navigation

- Home
- About
- Services
- Candidate Login
- Recruiter Login
- Admin Login

Hero Section

Headline

"Connecting Talent with Opportunity"

Buttons

- Candidate Registration
- Candidate Login

Footer

- About
- Contact
- Privacy Policy
- Terms
- Copyright

---

# User Roles

There are three roles.

- ADMIN
- RECRUITER
- CANDIDATE

All roles should have separate dashboards.

---

# Authentication

Use JWT Authentication.

After login redirect users according to role.

- Admin → /admin/dashboard
- Recruiter → /recruiter/dashboard
- Candidate → /candidate/dashboard

Passwords must be encrypted using bcrypt.

JWT should expire after configurable time.

---

# Candidate Module

## Registration

Candidate should register using

- Name
- Username
- Email
- Password
- Confirm Password

Validation

- Username must be unique
- Email must be unique
- Live email existence check
- Password strength meter (Weak / Medium / Strong)

Password Rules

- Minimum 8 characters
- Uppercase
- Lowercase
- Number
- Special character

Submit button disabled until form is valid.

---

## Candidate Login

- Email
- Password

Validation

- Email not found → "Email does not exist."
- Wrong password → "Incorrect password."

Support:

- Remember Me
- Forgot Password
- Email Verification

---

# Candidate Dashboard

Display:

- Welcome Card
- Application Status
- Assigned Recruiter
- Interview Date
- Google Meet Link
- Recruiter Feedback
- Rejection Reason
- Application Timeline

Candidate profile should include:

- Full Name (as per Resume)
- DOB
- Experience
- Technical Skills
  - Java
  - Python
  - C++
  - C
  - Others (textarea)
- Highest Qualification
- Current Company
- Current CTC
- Expected CTC
- Current Location
- Preferred Location
- Notice Period
- Resume Upload (PDF, Max 5 MB)

---

# Recruiter Module

Recruiters are created only by Admin.

Recruiter Dashboard

- Assigned Candidates
- Today's Interviews
- Pending Feedback
- Selected
- Rejected

Recruiter can:

- View candidate profile
- View resume
- Schedule interview
- Add Google Meet link
- Add interview date/time
- Update status
- Give feedback

Status Options

- Application Received
- Interview Scheduled
- Interview Completed
- Selected
- Rejected

Rejected status requires mandatory reason.

---

# Email Notifications

When interview is scheduled:

- Candidate receives email
- Sender = Admin Email
- CC = Recruiter Email
- Candidate dashboard displays Meet link

---

# Admin Module

Admin credentials should be configurable using environment variables.

Admin Features

- Create Recruiters
- Edit Recruiters
- Delete Recruiters
- Assign Candidates
- Override Candidate Status
- View Reports
- Dashboard Analytics

Recruiter assignment should recommend recruiters based on matching skills.

---

# Database

Tables

- Users
- Recruiters
- Candidates
- Applications
- Notifications

Use proper foreign keys and indexing.

---

# APIs

Authentication

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

Candidates

- GET /api/candidate/profile
- POST /api/candidate/profile
- PUT /api/candidate/profile

Recruiters

- GET /api/recruiters
- POST /api/recruiters
- PUT /api/recruiters/:id
- DELETE /api/recruiters/:id

Applications

- POST /api/applications/assign
- PUT /api/applications/status
- PUT /api/applications/interview

Notifications

- GET /api/notifications

---

# Security

- JWT
- bcrypt
- Helmet
- CORS
- Rate Limiting
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF Protection

---

# Deliverables

Generate:

- React + Vite + Tailwind frontend
- Node + Express backend
- MySQL schema
- SQL migrations
- REST APIs
- JWT authentication
- Role-based authorization
- Nodemailer integration
- Resume upload
- Responsive dashboards
- README
- Seed script
- Sample data
- Docker support (preferred)

Use clean MVC architecture and production-ready coding standards.

**Important:** Do not hardcode admin credentials. Load them from `.env` or create them via a secure seed script.
