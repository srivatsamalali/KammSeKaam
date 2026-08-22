const { Recruiter, Candidate, Application, User, Notification, Client, Job, ClientRequest } = require('../models')
const { sendPushNotification } = require('../utils/pushService')
const { generateToken } = require('../utils/tokenService')
const { sendNewClientRequestEmailToAdmin, sendClientRequestDecisionEmail } = require('../utils/emailService')

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

    const allCandidates = await Candidate.findAll()
    for (const cand of allCandidates) {
      try {
        await Application.findOrCreate({
          where: { candidateId: cand.id, jobId: null },
          defaults: { status: 'APPLICATION_RECEIVED' }
        })
      } catch (insertErr) {
        // Ignore race condition unique violations
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
        {
          model: Job,
        }
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

    // Fetch all applications that do not have an assigned recruiter
    const unassignedApplications = await Application.findAll({
      where: {
        recruiterId: null
      },
      include: [
        {
          model: Candidate,
          include: [User],
        },
        {
          model: Job,
        }
      ],
      order: [['createdAt', 'DESC']],
    })

    res.json(unassignedApplications)
  } catch (error) {
    console.error('Get unassigned candidates error:', error)
    res
      .status(500)
      .json({
        message: 'Error fetching unassigned applications',
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

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] })
    res.json(jobs)
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ message: 'Error retrieving jobs', error: error.message })
  }
}

const createJob = async (req, res) => {
  try {
    const { title, department, description, location, experience, requirements, salary, applyUrl } = req.body
    if (!title || !department || !description || !location || !experience) {
      return res.status(400).json({ message: 'Title, department, description, location and experience are required' })
    }
    const newJob = await Job.create({
      title,
      department,
      description,
      location,
      experience,
      requirements,
      salary,
      applyUrl,
      status: 'OPEN',
    })
    res.status(201).json(newJob)
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({ message: 'Error creating job', error: error.message })
  }
}

const updateJob = async (req, res) => {
  try {
    const { id } = req.params
    const { title, department, description, location, experience, requirements, salary, applyUrl, status } = req.body
    const job = await Job.findByPk(id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    if (title !== undefined) job.title = title
    if (department !== undefined) job.department = department
    if (description !== undefined) job.description = description
    if (location !== undefined) job.location = location
    if (experience !== undefined) job.experience = experience
    if (requirements !== undefined) job.requirements = requirements
    if (salary !== undefined) job.salary = salary
    if (applyUrl !== undefined) job.applyUrl = applyUrl
    if (status !== undefined) job.status = status

    await job.save()
    res.json(job)
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ message: 'Error updating job', error: error.message })
  }
}

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params
    const job = await Job.findByPk(id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    await job.destroy()
    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ message: 'Error deleting job', error: error.message })
  }
}

// Client Request Management
const submitClientRequest = async (req, res) => {
  try {
    const { name, company, email, phone, subject, requirements } = req.body

    if (!company || !email || !requirements) {
      return res.status(400).json({ message: 'Company name, contact email, and hiring requirements are required.' })
    }

    const newRequest = await ClientRequest.create({
      name: name || 'Hiring Contact',
      company,
      email,
      phone: phone || null,
      subject: subject || `Hiring Request from ${company}`,
      requirements,
      status: 'PENDING',
    })

    // Notify all Admin users in portal
    const admins = await User.findAll({ where: { role: 'ADMIN' } })
    for (const admin of admins) {
      try {
        await Notification.create({
          userId: admin.id,
          type: 'CLIENT_REQUEST',
          message: `New client hiring request from ${company} (${email})`,
        })
      } catch (notifErr) {
        console.error('Error creating admin notification for client request:', notifErr)
      }
    }

    // Send email alert to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in'
    sendNewClientRequestEmailToAdmin(
      adminEmail,
      company,
      name,
      email,
      phone,
      subject,
      requirements
    ).catch(err => console.error('Error in sendNewClientRequestEmailToAdmin async:', err))

    res.status(201).json({
      message: 'Your hiring request has been submitted successfully to Aston Recruitment.',
      request: newRequest,
    })
  } catch (error) {
    console.error('Submit client request error:', error)
    res.status(500).json({ message: 'Error submitting hiring request', error: error.message })
  }
}

const getClientRequests = async (req, res) => {
  try {
    const requests = await ClientRequest.findAll({
      order: [['createdAt', 'DESC']],
    })
    res.json(requests)
  } catch (error) {
    console.error('Get client requests error:', error)
    res.status(500).json({ message: 'Error retrieving client requests', error: error.message })
  }
}

const updateClientRequestStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body

    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const clientReq = await ClientRequest.findByPk(id)
    if (!clientReq) {
      return res.status(404).json({ message: 'Client request not found' })
    }

    clientReq.status = status
    if (adminNotes !== undefined) {
      clientReq.adminNotes = adminNotes
    }
    await clientReq.save()

    // If accepted, ensure an entry exists in the Clients table so admin can assign candidates immediately
    if (status === 'ACCEPTED') {
      try {
        const existingClient = await Client.findOne({
          where: { email: clientReq.email }
        })
        if (!existingClient) {
          await Client.create({
            name: clientReq.name || clientReq.company,
            company: clientReq.company,
            email: clientReq.email,
            phone: clientReq.phone || '',
          })
          console.log(`Auto-created Client registry entry for accepted company: ${clientReq.company}`)
        }
      } catch (clientCreateErr) {
        console.error('Error auto-creating client from accepted request:', clientCreateErr)
      }
    }

    // Send decision email to client
    sendClientRequestDecisionEmail(clientReq.email, clientReq.company, status)
      .catch(err => console.error('Error sending client decision email async:', err))

    res.json({
      message: `Client request marked as ${status}`,
      request: clientReq,
    })
  } catch (error) {
    console.error('Update client request status error:', error)
    res.status(500).json({ message: 'Error updating client request status', error: error.message })
  }
}

const deleteClientRequest = async (req, res) => {
  try {
    const { id } = req.params
    const clientReq = await ClientRequest.findByPk(id)
    if (!clientReq) {
      return res.status(404).json({ message: 'Client request not found' })
    }
    await clientReq.destroy()
    res.json({ message: 'Client request deleted successfully' })
  } catch (error) {
    console.error('Delete client request error:', error)
    res.status(500).json({ message: 'Error deleting client request', error: error.message })
  }
}

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
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  submitClientRequest,
  getClientRequests,
  updateClientRequestStatus,
  deleteClientRequest,
}
