const { Candidate, User, Application, Recruiter, Notification } = require('../models')
const pdfParse = require('pdf-parse')
const fs = require('fs')
const { uploadToGoogleDrive } = require('../utils/googleDriveService')
const { sendJobApplicationEmailToAdmin } = require('../utils/emailService')

const getProfile = async (req, res) => {
  try {
    const candidateId = req.user.id

    const candidate = await Candidate.findOne({
      where: { userId: candidateId },
      include: [{ model: User, attributes: ['email'] }],
    })

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }

    res.json(candidate)
  } catch (error) {
    console.error('Get profile error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching profile', error: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const candidateId = req.user.id

    const {
      name,
      dob,
      experience,
      technicalSkills,
      highestQualification,
      currentCompany,
      currentCTC,
      expectedCTC,
      currentLocation,
      preferredLocation,
      noticePeriod,
    } = req.body

    let candidate = await Candidate.findOne({
      where: { userId: candidateId },
    })

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }

    // Update fields
    if (name) candidate.name = name
    if (dob) candidate.dob = dob
    if (experience) candidate.experience = experience
    if (technicalSkills) candidate.technicalSkills = technicalSkills
    if (highestQualification) {
      candidate.highestQualification = highestQualification
    }
    if (currentCompany) candidate.currentCompany = currentCompany
    if (currentCTC) candidate.currentCTC = currentCTC
    if (expectedCTC) candidate.expectedCTC = expectedCTC
    if (currentLocation) candidate.currentLocation = currentLocation
    if (preferredLocation) candidate.preferredLocation = preferredLocation
    if (noticePeriod) candidate.noticePeriod = noticePeriod

    // Handle resume upload
    if (req.file) {
      try {
        console.log(
          'Uploading resume to Google Drive:',
          req.file.filename
        )

        const googleDriveFile = await uploadToGoogleDrive(
          req.file.path,
          req.file.filename
        )

        candidate.resumePath = googleDriveFile.webViewLink

        console.log(
          'Resume uploaded successfully to Google Drive:',
          googleDriveFile.webViewLink
        )
      } catch (uploadError) {
        console.error(
          'Failed to upload resume to Google Drive:',
          uploadError.message
        )

        // Fallback to local storage if Google Drive upload fails
        candidate.resumePath = `/uploads/resumes/${req.file.filename}`
      }

      // Auto parsing resume if PDF
      if (
        req.file.mimetype === 'application/pdf' ||
        req.file.filename.toLowerCase().endsWith('.pdf')
      ) {
        try {
          const filePath = req.file.path
          const dataBuffer = fs.readFileSync(filePath)
          const pdfData = await pdfParse(dataBuffer)
          const text = pdfData.text || ''

          // 1. Parse Skills
          const skillsList = [
            'JavaScript',
            'Python',
            'Java',
            'C++',
            'React',
            'Node',
            'SQL',
            'AWS',
            'HTML',
            'CSS',
            'Angular',
            'Go',
            'Rust',
            'Ruby',
            'PHP',
            'Docker',
            'Kubernetes',
            'MongoDB',
            'PostgreSQL',
            'Express',
            'TypeScript',
          ]

          const matchedSkills = []

          for (const skill of skillsList) {
            const regex = new RegExp(`\\b${skill}\\b`, 'i')

            if (regex.test(text)) {
              matchedSkills.push(skill)
            }
          }

          if (matchedSkills.length > 0) {
            // Merge with existing skills if any
            const existingSkills =
              candidate.technicalSkills || []

            const merged = Array.from(
              new Set([
                ...existingSkills,
                ...matchedSkills,
              ])
            )

            candidate.technicalSkills = merged
          }

          // 2. Parse Experience
          const expRegex =
            /\b(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?experience\b/i

          const match = text.match(expRegex)

          if (match && match[1]) {
            const years = parseInt(match[1], 10)

            if (
              !isNaN(years) &&
              (!candidate.experience ||
                candidate.experience === 0)
            ) {
              candidate.experience = years
            }
          }
        } catch (parseError) {
          console.error(
            'Failed to parse resume PDF:',
            parseError.message
          )
        }
      }
    }

    await candidate.save()

    res.json({
      message: 'Profile updated successfully',
      candidate,
    })
  } catch (error) {
    console.error('Update profile error:', error)

    res
      .status(500)
      .json({
        message: 'Error updating profile',
        error: error.message,
      })
  }
}

const getCandidateApplications = async (req, res) => {
  try {
    const candidateUserId = req.user.id

    const candidate = await Candidate.findOne({
      where: { userId: candidateUserId },
    })

    if (!candidate) {
      return res
        .status(404)
        .json({ message: 'Candidate not found' })
    }

    const applications = await Application.findAll({
      where: { candidateId: candidate.id },
      include: [{ model: Recruiter, include: [User] }],
    })

    res.json(applications)
  } catch (error) {
    console.error(
      'Get candidate applications error:',
      error
    )

    res
      .status(500)
      .json({
        message: 'Error fetching applications',
        error: error.message,
      })
  }
}

const applyToJob = async (req, res) => {
  try {
    const candidateUserId = req.user.id
    const { jobId, jobTitle, department, location } = req.body

    if (!jobId || !jobTitle) {
      return res.status(400).json({ message: 'Job ID and Job Title are required' })
    }

    // Find candidate details
    const candidate = await Candidate.findOne({
      where: { userId: candidateUserId },
      include: [{ model: User, attributes: ['email'] }],
    })

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' })
    }

    // Check if they already applied to this specific job
    const existingApp = await Application.findOne({
      where: { candidateId: candidate.id, jobId }
    })

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job opportunity!' })
    }

    // Create a new Application record
    await Application.create({
      candidateId: candidate.id,
      jobId,
      status: 'APPLICATION_RECEIVED'
    })

    // Find all Admin users to notify
    const admins = await User.findAll({ where: { role: 'ADMIN' } })

    // Create notifications for all admins
    const notificationPromises = admins.map(admin => {
      return Notification.create({
        userId: admin.id,
        type: 'JOB_APPLICATION',
        message: `Candidate ${candidate.name || 'Someone'} (${candidate.User?.email || ''}) applied for Job: ${jobTitle} (${department || 'General'})`,
      })
    })
    await Promise.all(notificationPromises)

    // Send emails to all admins
    const adminEmail = process.env.ADMIN_EMAIL_ENV || 'Contact@astonrecruitment.in'
    await sendJobApplicationEmailToAdmin(
      adminEmail,
      candidate.name || 'Someone',
      candidate.User?.email || '',
      jobTitle,
      department || 'General',
      location || 'Remote'
    )

    // Send to other admins in DB
    const emailPromises = admins
      .filter(admin => admin.email !== adminEmail)
      .map(admin => {
        return sendJobApplicationEmailToAdmin(
          admin.email,
          candidate.name || 'Someone',
          candidate.User?.email || '',
          jobTitle,
          department || 'General',
          location || 'Remote'
        )
      })
    await Promise.all(emailPromises)

    res.status(200).json({ message: 'Application submitted successfully directly in portal!' })
  } catch (error) {
    console.error('Apply to job error:', error)
    res.status(500).json({ message: 'Error submitting application', error: error.message })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getCandidateApplications,
  applyToJob
}