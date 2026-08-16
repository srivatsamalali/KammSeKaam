const { Recruiter, Candidate, Application, User, Notification, Client } = require('../models')
const { sendPushNotification } = require('../utils/pushService')
const { generateToken } = require('../utils/tokenService')

const syncCandidatesAndApplications = async () => {
  try {
    // 1. Ensure all Users with role CANDIDATE have a Candidate profile
    const candUsers = await User.findAll({ where: { role: 'CANDIDATE' } })
    for (const u of candUsers) {
      const existingProfile = await Candidate.findOne({ where: { userId: u.id } })
      if (!existingProfile) {
        const defaultName = u.email ? u.email.split('@')[0] : (u.phone || 'Candidate')
        await Candidate.create({
          userId: u.id,
          name: defaultName,
          mobileNumber: u.phone || '',
          address: '',
        })
      }
    }

    // 2. Ensure all Candidate profiles have an Application entry
    const allCandidates = await Candidate.findAll()
    for (const cand of allCandidates) {
      const existingApp = await Application.findOne({ where: { candidateId: cand.id } })
      if (!existingApp) {
        await Application.create({
          candidateId: cand.id,
          status: 'APPLICATION_RECEIVED',
        })
      }
    }
  } catch (err) {
    console.error('Error syncing candidates and applications:', err)
  }
}

const getDashboardStats = async (req, res) => {
  try {
    await syncCandidatesAndApplications()

    const totalCandidates = await Candidate.count()
    const totalRecruiters = await Recruiter.count()
    const totalApplications = await Application.count()
    const selectedCandidates = await Application.count({
      where: { status: 'SELECTED' },
    })
    const rejectedCandidates = await Application.count({
      where: { status: 'REJECTED' },
    })

    res.json({
      totalCandidates,
      totalRecruiters,
      totalApplications,
      selectedCandidates,
      rejectedCandidates,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching stats', error: error.message })
  }
}

const getReports = async (req, res) => {
  try {
    await syncCandidatesAndApplications()

    const applications = await Application.findAll({
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
      order: [['createdAt', 'DESC']],
    })

    res.json(applications)
  } catch (error) {
    console.error('Get reports error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching reports', error: error.message })
  }
}

const getUnassignedCandidates = async (req, res) => {
  try {
    await syncCandidatesAndApplications()

    // Fetch all candidates with their applications (if any)
    const candidates = await Candidate.findAll({
      include: [User, { model: Application, required: false }],
    })

    // Filter candidates that have no application records or unassigned recruiter
    const unassigned = candidates.filter(
      (c) => !c.Applications || c.Applications.length === 0 || c.Applications.every(a => !a.recruiterId),
    )

    res.json(unassigned)
  } catch (error) {
    console.error('Get unassigned candidates error:', error)
    res
      .status(500)
      .json({
        message: 'Error fetching unassigned candidates',
        error: error.message,
      })
  }
}

const overrideCandidateStatus = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { status, rejectionReason } = req.body

    const application = await Application.findByPk(applicationId)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    application.status = status
    if (status === 'REJECTED') {
      application.rejectionReason = rejectionReason
    }

    await application.save()

    // Notify candidate of status override
    try {
      const candidate = await Candidate.findByPk(application.candidateId)
      if (candidate) {
        await Notification.create({
          userId: candidate.userId,
          type: status,
          message: `Your application status was updated by administrator to: ${status}`,
        })
        await sendPushNotification(candidate.userId, {
          title: 'Status Updated by Admin',
          body: `Your application status is now: ${status}`,
          type: status,
        })
      }
    } catch (candNotifErr) {
      console.error('Failed to notify candidate of status override:', candNotifErr)
    }

    // Notify assigned recruiter of status override
    if (application.recruiterId) {
      try {
        const recruiter = await Recruiter.findByPk(application.recruiterId)
        if (recruiter && recruiter.userId) {
          const candidate = await Candidate.findByPk(application.candidateId)
          await Notification.create({
            userId: recruiter.userId,
            type: 'STATUS_OVERRIDDEN',
            message: `Administrator has overridden candidate ${candidate?.name || 'Candidate'} status to: ${status}`,
          })
          await sendPushNotification(recruiter.userId, {
            title: 'Candidate Status Overridden by Admin',
            body: `Admin updated candidate status to: ${status}`,
            type: 'STATUS_OVERRIDDEN',
          })
        }
      } catch (recNotifErr) {
        console.error('Failed to notify recruiter of status override:', recNotifErr)
      }
    }

    res.json({ message: 'Status overridden successfully', application })
  } catch (error) {
    console.error('Override status error:', error)
    res
      .status(500)
      .json({ message: 'Error overriding status', error: error.message })
  }
}

const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.findAll({
      include: [{ model: User, attributes: ['email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json(candidates)
  } catch (error) {
    console.error('Get candidates error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching candidates', error: error.message })
  }
}

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params
    const candidate = await Candidate.findByPk(id)
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }
    // Delete associated user
    await User.destroy({ where: { id: candidate.userId } })
    await candidate.destroy()
    res.json({ message: 'Candidate deleted successfully' })
  } catch (error) {
    console.error('Delete candidate error:', error)
    res
      .status(500)
      .json({ message: 'Error deleting candidate', error: error.message })
  }
}

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll()
    res.json(clients)
  } catch (error) {
    console.error('Get clients error:', error)
    res.status(500).json({ message: 'Error retrieving clients', error: error.message })
  }
}

const createClient = async (req, res) => {
  try {
    const { name, company, phone, email } = req.body
    if (!name || !company || !email) {
      return res.status(400).json({ message: 'Name, company and email are required' })
    }
    const newClient = await Client.create({ name, company, phone, email })
    res.status(201).json(newClient)
  } catch (error) {
    console.error('Create client error:', error)
    res.status(500).json({ message: 'Error creating client', error: error.message })
  }
}

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params
    const client = await Client.findByPk(id)
    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }
    await client.destroy()
    res.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Delete client error:', error)
    res.status(500).json({ message: 'Error deleting client', error: error.message })
  }
}


const impersonateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = generateToken(targetUser);
    res.json({
      token,
      user: { id: targetUser.id, email: targetUser.email, role: targetUser.role }
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    res.status(500).json({ message: 'Error during impersonation', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getReports,
  overrideCandidateStatus,
  getUnassignedCandidates,
  getAllCandidates,
  deleteCandidate,
  getClients,
  createClient,
  deleteClient,
  impersonateUser,
}
