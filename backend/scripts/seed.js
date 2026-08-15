require('dotenv').config()
const sequelize = require('../src/config/database')
const { User, Candidate, Recruiter, Application } = require('../src/models')
const bcrypt = require('bcryptjs')

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true })
    console.log('Database synced')

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL_ENV || 'Contact@astonrecruitment.in'
    const adminPassword = process.env.ADMIN_PASSWORD_ENV || 'Admin@12345'

    const adminUser = await User.create({
      email: adminEmail,
      phone: '9000000000',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
    })

    console.log('Admin user created:', {
      email: adminEmail,
      password: adminPassword,
    })

    // Create sample recruiters
    const recruiter1 = await User.create({
      email: 'recruiter1@astonrecruitment.in',
      phone: '9876543201',
      password: 'Recruiter@123',
      role: 'RECRUITER',
      isEmailVerified: true,
      isPhoneVerified: true,
    })

    await Recruiter.create({
      userId: recruiter1.id,
      name: 'Rajesh Kumar',
      mobileNumber: '9876543201',
      address: 'Bangalore',
      specialization: ['Java', 'Python'],
    })

    const recruiter2 = await User.create({
      email: 'recruiter2@astonrecruitment.in',
      phone: '9876543202',
      password: 'Recruiter@123',
      role: 'RECRUITER',
      isEmailVerified: true,
      isPhoneVerified: true,
    })

    await Recruiter.create({
      userId: recruiter2.id,
      name: 'Priya Sharma',
      mobileNumber: '9876543202',
      address: 'Mumbai',
      specialization: ['C++', 'JavaScript'],
    })

    console.log('Sample recruiters created')

    // Create sample candidates
    const candidate1 = await User.create({
      email: 'john@example.com',
      phone: '9876543203',
      password: 'Candidate@123',
      role: 'CANDIDATE',
      isEmailVerified: true,
      isPhoneVerified: true,
    })

    await Candidate.create({
      userId: candidate1.id,
      name: 'John Doe',
      mobileNumber: '9876543203',
      address: 'Bangalore',
      experience: 5,
      technicalSkills: ['Java', 'Python', 'JavaScript'],
      highestQualification: 'B.Tech',
      currentCompany: 'Tech Corp',
      currentCTC: 1200000,
      expectedCTC: 1500000,
      currentLocation: 'Bangalore',
      preferredLocation: 'Bangalore, Pune',
      noticePeriod: '30 days',
    })

    const candidate2 = await User.create({
      email: 'jane@example.com',
      phone: '9876543204',
      password: 'Candidate@123',
      role: 'CANDIDATE',
      isEmailVerified: true,
      isPhoneVerified: true,
    })

    await Candidate.create({
      userId: candidate2.id,
      name: 'Jane Smith',
      experience: 3,
      technicalSkills: ['C++', 'JavaScript', 'React'],
      highestQualification: 'B.Tech',
      currentCompany: 'Software Solutions',
      currentCTC: 800000,
      expectedCTC: 1000000,
      currentLocation: 'Delhi',
      preferredLocation: 'Delhi, Noida',
      noticePeriod: '15 days',
    })

    console.log('Sample candidates created')

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
