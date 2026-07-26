# kaamSeKaam - Consultancy Management Portal

A modern, responsive, full-stack consultancy management portal that connects talent with opportunity. Built with React, Node.js, Express, and MySQL.

## 🎯 Features

### Three Separate Portals

- **Admin Portal**: Manage recruiters, candidates, and applications
- **Recruiter Portal**: View candidates, schedule interviews, provide feedback
- **Candidate Portal**: Manage profile, track applications, view interviews

### Key Features

- ✨ JWT Authentication with role-based access
- 📧 Email notifications for interview scheduling
- 📄 Resume upload and management (PDF)
- 📞 Google Meet integration for interviews
- 📊 Analytics and reporting
- 🔒 Secure password hashing with bcrypt
- 🔐 Input validation and SQL injection protection
- 📱 Fully responsive design
- 🎨 Clean, minimal, professional UI with TailwindCSS

## 🛠️ Technology Stack

### Frontend

- React 18
- Vite
- React Router
- TailwindCSS
- React Hook Form
- Axios

### Backend

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Nodemailer
- Multer (file upload)

### Database

- MySQL 8.0

### Deployment

- Docker & Docker Compose
- Production-ready MVC architecture

## 📋 Prerequisites

### Local Development

- Node.js v18+ ([Download](https://nodejs.org/))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- npm or yarn

### Docker Deployment

- Docker ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose

## 🚀 Quick Start (Local Development)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=kaamsekaaam
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@kaamsekaaam.com

# Admin Credentials
ADMIN_EMAIL_ENV=admin@kaamsekaaam.com
ADMIN_PASSWORD_ENV=Admin@12345

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Setting up Gmail SMTP:**

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated password in `SMTP_PASSWORD`

Create MySQL database:

```bash
mysql -u root -p
CREATE DATABASE kaamsekaaam;
EXIT;
```

Seed sample data:

```bash
npm run seed
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Access the Application

**Landing Page:** http://localhost:5173

**Login Credentials:**

```
Admin Portal:
Email: admin@kaamsekaaam.com
Password: Admin@12345

Sample Recruiter:
Email: recruiter1@kaamsekaaam.com
Password: Recruiter@123

Sample Candidate:
Email: john@example.com
Password: Candidate@123
```

## 🐳 Docker Deployment (All-in-One)

### 1. Build & Run with Docker Compose

```bash
docker-compose up --build
```

This will start:

- MySQL database (port 3306)
- Node.js backend (port 5000)
- React frontend (port 5173)

### 2. Access Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MySQL: localhost:3306

### 3. Stop Services

```bash
docker-compose down
```

To also remove volumes:

```bash
docker-compose down -v
```

## 📁 Project Structure

```
kaamsekaaam/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API service calls
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, file upload
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # DB, JWT, Email config
│   │   └── server.js        # Main server file
│   ├── scripts/
│   │   └── seed.js          # Database seeding
│   ├── uploads/             # Resume storage
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── database/
│   └── schema.sql           # Database schema
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)
- ✅ XSS protection
- ✅ File upload validation (PDF only, 5MB max)

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register         - Register new candidate
POST   /api/auth/login            - Login user
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password
```

### Candidate Endpoints

```
GET    /api/candidate/profile     - Get candidate profile
PUT    /api/candidate/profile     - Update profile with resume
```

### Recruiter Endpoints

```
GET    /api/recruiters            - Get all recruiters (Admin only)
POST   /api/recruiters            - Create recruiter (Admin only)
PUT    /api/recruiters/:id        - Update recruiter (Admin only)
DELETE /api/recruiters/:id        - Delete recruiter (Admin only)
GET    /api/recruiters/applications - Get recruiter's applications
```

### Application Endpoints

```
POST   /api/applications/assign   - Assign candidate to recruiter
PUT    /api/applications/:id/status  - Update application status
PUT    /api/applications/:id/interview - Schedule interview
PUT    /api/applications/:id/feedback - Add feedback
```

### Admin Endpoints

```
GET    /api/admin/dashboard       - Dashboard statistics
GET    /api/admin/reports         - All applications report
PUT    /api/admin/applications/:id - Override candidate status
```

### Notification Endpoints

```
GET    /api/notifications         - Get user notifications
PUT    /api/notifications/:id/read - Mark notification as read
```

## 🔄 User Workflow

### Candidate Flow

1. ✅ Register with email, password, name
2. ✅ Login to access dashboard
3. ✅ Complete profile (experience, skills, location, etc.)
4. ✅ Upload resume (PDF, max 5MB)
5. ✅ Admin assigns to recruiter
6. ✅ Receive interview notifications
7. ✅ Join interview via Google Meet link

### Recruiter Flow

1. ✅ Created by Admin
2. ✅ Login with credentials
3. ✅ View assigned candidates
4. ✅ Schedule interviews
5. ✅ Add Google Meet link
6. ✅ Provide feedback
7. ✅ Update application status

### Admin Flow

1. ✅ Login with default credentials
2. ✅ Create recruiters
3. ✅ Assign candidates to recruiters
4. ✅ View dashboard analytics
5. ✅ Override candidate status
6. ✅ View comprehensive reports

## 📧 Email Configuration

The system sends automated emails for:

- Interview scheduling (to candidate, CC recruiter)
- Password reset links
- Application status updates

Gmail SMTP is configured by default. For production, use:

- AWS SES
- SendGrid
- Mailgun
- etc.

Update `SMTP_*` variables in `.env`

## 📱 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

## 🚢 Production Deployment

### Using GoDaddy (from the requirements)

1. **Purchase VPS/Hosting:**
   - Go to GoDaddy.com
   - Select VPS or Web Hosting
   - Choose appropriate plan

2. **Deploy with Docker:**

   ```bash
   # SSH into your server
   ssh user@your-godaddy-ip

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Clone repository
   git clone <your-repo-url>
   cd kaamsekaaam

   # Update .env with production values
   # Update FRONTEND_URL, SMTP credentials, JWT_SECRET

   # Run with Docker
   docker-compose -f docker-compose.yml up -d
   ```

3. **Setup Domain:**
   - Point GoDaddy domain to server IP
   - Configure SSL certificate (Let's Encrypt)
   - Setup reverse proxy (Nginx)

4. **Environment Variables for Production:**
   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-strong-random-secret>
   DB_PASSWORD=<strong-db-password>
   SMTP_USER=<your-email>
   SMTP_PASSWORD=<your-password>
   FRONTEND_URL=https://yourdomain.com
   ```

### Production Checklist

- [ ] Update all environment variables
- [ ] Setup SSL/TLS certificates
- [ ] Configure database backups
- [ ] Setup email service (not Gmail for production)
- [ ] Enable HTTPS only
- [ ] Setup monitoring & logging
- [ ] Configure firewall rules
- [ ] Setup CI/CD pipeline

## 🐛 Troubleshooting

### MySQL Connection Error

```bash
# Check MySQL is running
mysql -u root -p

# Update DB_HOST, DB_USER, DB_PASSWORD in .env
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # For backend
lsof -i :5173  # For frontend

# Kill process
kill -9 <PID>
```

### Email Not Sending

- Check SMTP credentials
- Verify "Less secure apps" is enabled (Gmail)
- Check Gmail generated app password
- Review backend logs

### Database Sync Issues

```bash
# Restart backend to re-sync
npm run dev

# Or manually sync in backend/src/server.js
# Change: alt: process.env.NODE_ENV === 'development'
# To: force: true (be careful, data will be lost)
```

## 📞 Support & Contact

For issues or questions:

- Email: support@kaamsekaaam.com
- GitHub: [Your Repository]

## 📄 License

Private - All rights reserved © 2024 kaamSeKaam

## 🎓 Development Notes

### Adding New Features

1. **New Endpoint:**
   - Create controller in `backend/src/controllers/`
   - Create route in `backend/src/routes/`
   - Add route to `backend/src/server.js`

2. **New Page:**
   - Create component in `frontend/src/pages/`
   - Add route in `frontend/src/App.jsx`
   - Add to protected routes if needed

3. **New Database Model:**
   - Create model in `backend/src/models/`
   - Update associations in `backend/src/models/index.js`
   - Update schema in `database/schema.sql`

### Testing Flows

Use Postman or Thunder Client to test APIs:

- Import endpoints from API documentation
- Set Authorization header with JWT token
- Test with different user roles

## ✨ Future Enhancements

- [ ] Video interview recording
- [ ] Skill assessment tests
- [ ] Salary negotiation tool
- [ ] Multiple file resume versions
- [ ] Interview feedback templates
- [ ] Candidate recommendation engine
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (Socket.io)
- [ ] Advanced analytics & reports
- [ ] Interview calendar sync

---

**Built with ❤️ for connecting talent with opportunity**
