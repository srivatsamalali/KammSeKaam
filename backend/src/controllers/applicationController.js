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

    // Check if application already exists
    const existingApp = await Application.findOne({ where: { candidateId } })

    if (existingApp) {
      return res
        .status(400)
        .json({ message: 'Application already exists for this candidate' })
    }

    const application = await Application.create({
      candidateId,
      recruiterId,
      status: 'APPLICATION_RECEIVED',
    })

    // Create notification for candidate
    const candidate = await Candidate.findByPk(candidateId)
    await Notification.create({
      userId: candidate.userId,
      type: 'APPLICATION_RECEIVED',
      message: 'Your application has been received successfully',
    })

    res.status(201).json({
      message: 'Candidate assigned successfully',
      application,
    })
  } catch (error) {
    console.error('Assign candidate error:', error)
    res
      .status(500)
      .json({ message: 'Error assigning candidate', error: error.message })
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

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { interviewDate, googleMeetLink } = req.body

    if (!interviewDate || !googleMeetLink) {
      return res
        .status(400)
        .json({ message: 'Interview date and Google Meet link required' })
    }

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
    application.googleMeetLink = googleMeetLink
    application.status = 'INTERVIEW_SCHEDULED'

    await application.save()

    // Send email notification
    const candidateUser = application.Candidate?.User
    const recruiterUser = application.Recruiter?.User

    // Try sending email but don't fail the request if email fails
    try {
      if (candidateUser && recruiterUser) {
        await sendInterviewScheduledEmail(
          candidateUser.email,
          application.Candidate.name,
          recruiterUser.email,
          interviewDate,
          googleMeetLink,
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
