# kaamSeKaam Installation & Quick Start Guide

## 📝 Quick Setup (5 minutes)

### Step 1: Install Dependencies

**Windows:**

```bash
setup.bat
```

**Mac/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure Backend

Create `.env` file in `backend/` folder:

```env
# Database (localhost)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=kaamsekaaam

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=dev_secret_change_in_production
JWT_EXPIRATION=7d

# Email (Optional for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Admin
ADMIN_EMAIL_ENV=admin@kaamsekaaam.com
ADMIN_PASSWORD_ENV=Admin@12345

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup Database

```bash
# Create database
mysql -u root -p
CREATE DATABASE kaamsekaaam;
EXIT;

# Run migrations (automatic on first backend start)
# Or manually import schema
mysql -u root -p kaamsekaaam < database/schema.sql
```

### Step 4: Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:

- Admin user
- 2 sample recruiters
- 2 sample candidates

### Step 5: Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

### Step 6: Test the Application

Access http://localhost:5173 and login with:

```
Admin Login:
- Email: admin@kaamsekaaam.com
- Password: Admin@12345

Candidate Login:
- Email: john@example.com
- Password: Candidate@123

Recruiter Login:
- Email: recruiter1@kaamsekaaam.com
- Password: Recruiter@123
```

## 🐳 Docker Setup (2 minutes)

```bash
# Start all services
docker-compose up --build

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# MySQL:    localhost:3306

# Stop
docker-compose down
```

## 🔧 Common Issues & Solutions

### MySQL Connection Error

```bash
# Check MySQL is running
mysql -u root -p

# If connection fails, verify:
# 1. MySQL service is running
# 2. DB_USER and DB_PASSWORD are correct in .env
# 3. Database exists (kaamsekaaam)
```

### Port Already in Use

```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Won't Connect to Frontend

- Check FRONTEND_URL in backend/.env
- Make sure both servers are running
- Clear browser cache and cookies

## 📚 API Testing

Use **Postman** or **Thunder Client** to test APIs:

1. Create new request
2. Method: POST
3. URL: `http://localhost:5000/api/auth/login`
4. Body (JSON):
   ```json
   {
     "email": "admin@kaamsekaaam.com",
     "password": "Admin@12345"
   }
   ```
5. Copy the token from response
6. For other requests, add header:
   ```
   Authorization: Bearer <token>
   ```

## 🚀 Production Deployment (GoDaddy)

### 1. Prepare Server

```bash
# SSH to your GoDaddy server
ssh user@your-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
```

### 2. Deploy

```bash
# Clone repo
git clone <your-repo> kaamsekaaam
cd kaamsekaaam

# Create .env with production values
cp backend/.env.example backend/.env
# Edit backend/.env with production config

# Start with Docker
docker-compose up -d
```

### 3. Setup Domain & SSL

```bash
# Use Let's Encrypt with Nginx
# Configure reverse proxy to point to backend/frontend
```

### 4. Monitor

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 File Upload Limits

- Max file size: 5MB
- Format: PDF only
- Stored in: `backend/uploads/resumes/`

## 🔐 Security Tips for Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (generate random)
- [ ] Enable HTTPS with SSL certificate
- [ ] Use environment variables for all secrets
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Use production email service (not Gmail)
- [ ] Set NODE_ENV=production
- [ ] Enable CORS properly
- [ ] Setup rate limiting
- [ ] Monitor logs regularly

## 📞 Helpful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run seed         # Seed sample data
npm install          # Install dependencies

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm install          # Install dependencies

# Docker
docker-compose up --build     # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker ps                     # List running containers
```

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Database `kaamsekaaam` created
- [ ] Backend `.env` configured
- [ ] Backend npm packages installed
- [ ] Frontend npm packages installed
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Sample data seeded
- [ ] Can login with test credentials
- [ ] Can navigate all portals

## 🎓 Next Steps

1. ✅ **Complete Setup** - Follow steps 1-6 above
2. 📖 **Read README.md** - Full documentation
3. 🔧 **Explore Code** - Understand the structure
4. 🚀 **Deploy** - Follow production guide
5. 📈 **Monitor** - Setup logging and backups
6. 🎨 **Customize** - Add your branding

---

**Happy Coding! 🚀**

For detailed documentation, see [README.md](README.md)
