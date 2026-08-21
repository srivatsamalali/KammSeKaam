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
const messageRoutes = require('./routes/messageRoutes')

const app = express()

app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

// CORS
const frontendOrigins = (
  process.env.FRONTEND_URL ||
  'http://astonrecruitment.in,https://astonrecruitment.in,http://www.astonrecruitment.in,https://www.astonrecruitment.in'
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
app.use('/api/applications', messageRoutes)
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
  const adminEmail = process.env.ADMIN_EMAIL_ENV || 'Contact@astonrecruitment.in'
  const adminPassword = process.env.ADMIN_PASSWORD_ENV || 'Admin@12345'

  const existingAdmin = await User.findOne({ where: { email: adminEmail } })

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
    // If admin exists with placeholder password, update it
    if (existingAdmin.password === '$2a$10$...' || existingAdmin.password.length < 10) {
      existingAdmin.password = adminPassword
      await existingAdmin.save()
      console.log('Admin user password updated/reset')
    } else {
      console.log('Admin user already exists:', existingAdmin.email)
    }
  }
}

const runMigrations = async () => {
  try {
    console.log('Running automatic schema check/migration...')
    // 1. Check if column isRead exists in Messages table
    const [messagesCols] = await sequelize.query("SHOW COLUMNS FROM `Messages` LIKE 'isRead'")
    if (messagesCols.length === 0) {
      console.log("Column 'isRead' not found in table 'Messages'. Adding it...")
      await sequelize.query('ALTER TABLE `Messages` ADD COLUMN `isRead` TINYINT(1) DEFAULT 0')
      console.log("Column 'isRead' added successfully!")
    }

    // 2. Check if column jobId exists in Applications table
    const [appCols] = await sequelize.query("SHOW COLUMNS FROM `Applications` LIKE 'jobId'")
    if (appCols.length === 0) {
      console.log("Column 'jobId' not found in table 'Applications'. Adding it...")
      await sequelize.query('ALTER TABLE `Applications` ADD COLUMN `jobId` VARCHAR(36) NULL')
      console.log("Column 'jobId' added successfully!")
    }

    // 3. Remove unique constraint on candidateId in Applications table
    try {
      console.log('Cleaning up orphaned Applications records...')
      await sequelize.query('DELETE FROM `Applications` WHERE `candidateId` NOT IN (SELECT `id` FROM `Candidates`)')
      
      console.log('Checking unique constraint unique_candidate on Applications...')
      // Query foreign key constraint name
      const [fkResults] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'Applications' 
          AND COLUMN_NAME = 'candidateId' 
          AND REFERENCED_TABLE_NAME = 'Candidates'
      `)
      
      if (fkResults.length > 0) {
        const fkName = fkResults[0].CONSTRAINT_NAME
        
        // Check if the unique key unique_candidate exists
        const [indexResults] = await sequelize.query("SHOW INDEX FROM `Applications` WHERE Key_name = 'unique_candidate'")
        if (indexResults.length > 0) {
          console.log(`Found foreign key: ${fkName}. Dropping foreign key and index unique_candidate...`)
          
          // 1. Drop foreign key
          await sequelize.query(`ALTER TABLE \`Applications\` DROP FOREIGN KEY \`${fkName}\``)
          
          // 2. Drop unique index
          await sequelize.query('ALTER TABLE `Applications` DROP INDEX `unique_candidate`')
          
          // 3. Add non-unique index
          await sequelize.query('ALTER TABLE `Applications` ADD INDEX `idx_candidateId` (`candidateId`)')
          
          // 4. Add foreign key back without unique restriction
          await sequelize.query(`
            ALTER TABLE \`Applications\` 
            ADD CONSTRAINT \`${fkName}\` 
            FOREIGN KEY (\`candidateId\`) REFERENCES \`Candidates\` (\`id\`) 
            ON DELETE CASCADE ON UPDATE CASCADE
          `)
          
          console.log('Successfully removed unique constraint and updated foreign key!')
        } else {
          console.log('Unique constraint unique_candidate already removed or does not exist.')
        }
      }
    } catch (err) {
      if (!err.message.includes("check that column/key exists") && !err.message.includes("doesn't exist")) {
        console.error('Error updating unique_candidate constraint:', err.message)
      }
    }
  } catch (err) {
    console.error('Error running automatic schema check/migration:', err)
  }
}

const startServer = async () => {
  try {
    // Sync database - use force: false to prevent recreating tables
    await sequelize.sync()
    console.log('Database synced')

    // Run automatic migrations for schema updates
    await runMigrations()

    // Ensure default admin exists
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
