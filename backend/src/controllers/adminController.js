const { Recruiter, Candidate, Application, User } = require('../models')

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

    res.json({ message: 'Status overridden successfully', application })
  } catch (error) {
    console.error('Override status error:', error)
    res
      .status(500)
      .json({ message: 'Error overriding status', error: error.message })
  }
}

module.exports = {
  getDashboardStats,
  getReports,
  overrideCandidateStatus,
  getUnassignedCandidates,
}
