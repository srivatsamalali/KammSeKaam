const { Recruiter, Candidate, Application, User } = require('../models')

const getDashboardStats = async (req, res) => {
  try {
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
    // Fetch all candidates with their applications (if any)
    const candidates = await Candidate.findAll({
      include: [User, { model: Application, required: false }],
    })

    // Filter candidates that have no application records
    const unassigned = candidates.filter(
      (c) => !c.Applications || c.Applications.length === 0,
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
