const {
  Application,
  Candidate,
  Recruiter,
  User,
  Notification,
} = require('../models')
const { sendInterviewScheduledEmail } = require('../utils/emailService')

const assignCandidate = async (req, res) => {
  try {
    const { candidateId, recruiterId } = req.body

    if (!candidateId || !recruiterId) {
      return res
        .status(400)
        .json({ message: 'Candidate ID and Recruiter ID required' })
    }

    const recruiter = await Recruiter.findByPk(recruiterId)
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' })
    }

    const candidate = await Candidate.findByPk(candidateId)
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }

    // Check if application already exists for candidate
    let application = await Application.findOne({ where: { candidateId } })

    if (application) {
      // Update existing application with assigned recruiter
      application.recruiterId = recruiterId
      await application.save()
    } else {
      // Create new application record
      application = await Application.create({
        candidateId,
        recruiterId,
        status: 'APPLICATION_RECEIVED',
      })
    }

    // Update recruiter assigned candidates count
    const assignedCount = await Application.count({ where: { recruiterId } })
    recruiter.assignedCandidates = assignedCount
    await recruiter.save()

    // Create notification for candidate if userId exists
    if (candidate && candidate.userId) {
      try {
        await Notification.create({
          userId: candidate.userId,
          type: 'APPLICATION_RECEIVED',
          message: 'Your application has been assigned to a recruiter',
        })
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message)
      }
    }

    res.status(200).json({
      message: 'Candidate assigned successfully',
      application,
    })
  } catch (error) {
    console.error('Assign candidate error:', error)
    res
      .status(500)
      .json({ message: error.message || 'Error assigning candidate', error: error.message })
  }
}

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { status, rejectionReason } = req.body

    const validStatuses = [
      'APPLICATION_RECEIVED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'SELECTED',
      'REJECTED',
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const application = await Application.findByPk(applicationId)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    application.status = status
    if (status === 'REJECTED') {
      application.rejectionReason = rejectionReason
    }

    await application.save()

    // Create notification (don't fail the request if notifications fail)
    try {
      const candidate = await Candidate.findByPk(application.candidateId)
      if (candidate) {
        await Notification.create({
          userId: candidate.userId,
          type: status,
          message: `Your application status: ${status}`,
        })
      }
    } catch (notifErr) {
      console.error(
        'Failed to create notification after status update:',
        notifErr,
      )
    }

    res.json({ message: 'Status updated successfully', application })
  } catch (error) {
    console.error('Update status error:', error)
    res
      .status(500)
      .json({ message: 'Error updating status', error: error.message })
  }
}

const generateAutoMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const gen = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const code = `${gen(3)}-${gen(4)}-${gen(3)}`
  return `https://cal.com/aston-recruitment/interview-${code}`
}

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { interviewDate, googleMeetLink } = req.body

    if (!interviewDate) {
      return res
        .status(400)
        .json({ message: 'Interview date is required' })
    }

    const finalMeetLink = (googleMeetLink && googleMeetLink.trim())
      ? googleMeetLink.trim()
      : generateAutoMeetLink()

    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Candidate,
          include: [User],
        },
        {
          model: Recruiter,
          include: [User],
        },
      ],
    })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    application.interviewDate = interviewDate
    application.googleMeetLink = finalMeetLink
    application.status = 'INTERVIEW_SCHEDULED'

    await application.save()

    // Send email notification
    const candidateUser = application.Candidate?.User
    const recruiterUser = application.Recruiter?.User
    const candidateEmail = candidateUser?.email || ''
    const candidateName = application.Candidate?.name || 'Candidate'
    const recruiterEmail = recruiterUser?.email || ''
    const recruiterName = application.Recruiter?.name || 'Assigned Recruiter'

    // Try sending email but don't fail the request if email fails
    try {
      if (candidateEmail) {
        await sendInterviewScheduledEmail(
          candidateEmail,
          candidateName,
          recruiterEmail,
          recruiterName,
          interviewDate,
          finalMeetLink,
        )
      }
    } catch (emailErr) {
      console.error('Failed to send interview email, continuing:', emailErr)
    }

    // Create notification (only if candidate user present)
    if (candidateUser) {
      await Notification.create({
        userId: candidateUser.id,
        type: 'INTERVIEW_SCHEDULED',
        message: `Your interview has been scheduled for ${new Date(
          interviewDate,
        ).toLocaleString()}`,
      })
    }

    res.json({
      message: 'Interview scheduled successfully',
      application,
    })
  } catch (error) {
    console.error('Schedule interview error:', error)
    res
      .status(500)
      .json({ message: 'Error scheduling interview', error: error.message })
  }
}

const addInterviewFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { feedback, status } = req.body

    const application = await Application.findByPk(applicationId)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    application.feedback = feedback
    if (status) {
      application.status = status
    }

    await application.save()

    res.json({ message: 'Feedback added successfully', application })
  } catch (error) {
    console.error('Add feedback error:', error)
    res
      .status(500)
      .json({ message: 'Error adding feedback', error: error.message })
  }
}

module.exports = {
  assignCandidate,
  updateApplicationStatus,
  scheduleInterview,
  addInterviewFeedback,
}
