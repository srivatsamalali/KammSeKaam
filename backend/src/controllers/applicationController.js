const {
  Application,
  Candidate,
  Recruiter,
  User,
  Notification,
} = require('../models')
const { sendInterviewScheduledEmail } = require('../utils/emailService')
const { sendPushNotification } = require('../utils/pushService')

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
        await sendPushNotification(candidate.userId, {
          title: 'Application Assigned',
          body: 'Your application has been assigned to a recruiter',
          type: 'APPLICATION_RECEIVED'
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
    const {
      status,
      rejectionReason,
      technicalRating,
      communicationRating,
      culturalRating,
      feedbackComments,
      recommendation,
      clientId,
    } = req.body

    const validStatuses = [
      'APPLICATION_RECEIVED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'SELECTED',
      'REJECTED',
      'SENT_TO_CLIENT',
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

    if (technicalRating !== undefined) application.technicalRating = technicalRating
    if (communicationRating !== undefined) application.communicationRating = communicationRating
    if (culturalRating !== undefined) application.culturalRating = culturalRating
    if (feedbackComments !== undefined) application.feedbackComments = feedbackComments
    if (recommendation !== undefined) application.recommendation = recommendation
    if (clientId !== undefined) application.clientId = clientId

    await application.save()

    // Create notification (don't fail the request if notifications fail)
    try {
      const candidate = await Candidate.findByPk(application.candidateId, {
        include: [{ model: User }]
      })
      if (candidate) {
        await Notification.create({
          userId: candidate.userId,
          type: status,
          message: `Your application status: ${status}`,
        })
        await sendPushNotification(candidate.userId, {
          title: 'Status Updated',
          body: `Your application status is now: ${status}`,
          type: status
        })

        // Send Email notifications for Selected/Rejected/Sent to Client updates
        if (candidate.User && candidate.User.email) {
          const emailService = require('../utils/emailService')
          if (status === 'SELECTED') {
            await emailService.sendSelectionEmail(candidate.User.email, candidate.name)
          } else if (status === 'REJECTED') {
            await emailService.sendRejectionEmail(candidate.User.email, candidate.name, rejectionReason)
          } else if (status === 'SENT_TO_CLIENT') {
            const finalClientId = clientId || application.clientId
            if (finalClientId) {
              const { Client } = require('../models')
              const client = await Client.findByPk(finalClientId)
              if (client) {
                // Email 1: Send to client
                await emailService.sendSentToClientEmailToClient(client.email, client.name, candidate.name, candidate.resumePath)
                // Email 2: Send to candidate
                await emailService.sendSentToClientEmailToCandidate(candidate.User.email, candidate.name, client.name, client.company)
              }
            }
          }
        }
      }

      // Notify all admin users when recruiter changes status
      if (req.user && req.user.role === 'RECRUITER') {
        const admins = await User.findAll({ where: { role: 'ADMIN' } })
        for (const admin of admins) {
          await Notification.create({
            userId: admin.id,
            type: 'STATUS_UPDATED',
            message: `Recruiter updated candidate ${candidate?.name || 'Candidate'} status to: ${status}`,
          })
          await sendPushNotification(admin.id, {
            title: 'Candidate Status Updated',
            body: `Recruiter updated status to: ${status}`,
            type: 'STATUS_UPDATED'
          })
        }
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
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0]
  return `${frontendUrl}/meeting/${code}`
}

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { interviewDate, googleMeetLink, interviewDuration } = req.body

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
    application.interviewDuration = interviewDuration ? parseInt(interviewDuration) : 60
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
          application.interviewDuration || 60,
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
      await sendPushNotification(candidateUser.id, {
        title: 'Interview Scheduled',
        body: `Your interview has been scheduled for ${new Date(interviewDate).toLocaleString()}`,
        type: 'INTERVIEW_SCHEDULED'
      })
    }

    // Create notification for recruiter
    if (application.Recruiter && application.Recruiter.userId) {
      try {
        const candidateName = application.Candidate?.name || 'Candidate'
        await Notification.create({
          userId: application.Recruiter.userId,
          type: 'INTERVIEW_SCHEDULED',
          message: `Interview scheduled for candidate ${candidateName} on ${new Date(interviewDate).toLocaleString()}`,
        })
        await sendPushNotification(application.Recruiter.userId, {
          title: 'Interview Scheduled',
          body: `Interview scheduled for ${candidateName} on ${new Date(interviewDate).toLocaleString()}`,
          type: 'INTERVIEW_SCHEDULED'
        })
      } catch (recruiterNotifErr) {
        console.error('Failed to notify recruiter of scheduled interview:', recruiterNotifErr)
      }
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
