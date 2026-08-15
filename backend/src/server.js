require('dotenv').config() // Reloaded SMTP settings
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const sequelize = require('./config/database')
const path = require('path')

// Import models to sync
const { User } = require('./models')

// Import routes
const authRoutes = require('./routes/authRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
const recruiterRoutes = require('./routes/recruiterRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const adminRoutes = require('./routes/adminRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

const app = express()

// Security middleware
app.use(helmet())

// CORS
const frontendOrigins = (
  process.env.FRONTEND_URL ||
  'http://localhost:5173,http://localhost:5174,http://localhost:5175'
)
  .split(',')
  .map((url) => url.trim())

const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        frontendOrigins.includes(origin) ||
        isLocalhostOrigin(origin)
      ) {
        return callback(null, true)
      }
      callback(new Error(`CORS origin not allowed: ${origin}`))
    },
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/candidate', candidateRoutes)
app.use('/api/recruiters', recruiterRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

// Database connection and server start
const PORT = process.env.PORT || 5000

const ensureAdminUser = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL_ENV || 'Contact@astonrecruitment.in'
  const adminPassword = process.env.ADMIN_PASSWORD_ENV || 'Admin@12345'

  const existingAdmin = await User.findOne({ where: { role: 'ADMIN' } })

  if (!existingAdmin) {
    await User.create({
      email: adminEmail,
      phone: '9000000000',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
    })
    console.log('Default admin user created:', { email: adminEmail })
  } else {
    console.log('Admin user already exists:', existingAdmin.email)
  }
}

const startServer = async () => {
  try {
    // Sync database - use force: false to prevent recreating tables
    await sequelize.sync({ force: false })
    console.log('Database synced')

    // Ensure default admin exists in development
    await ensureAdminUser()

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
