const { Candidate, User, Application, Recruiter } = require('../models')

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

    let candidate = await Candidate.findOne({ where: { userId: candidateId } })

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' })
    }

    // Update fields
    if (name) candidate.name = name
    if (dob) candidate.dob = dob
    if (experience) candidate.experience = experience
    if (technicalSkills) candidate.technicalSkills = technicalSkills
    if (highestQualification)
      candidate.highestQualification = highestQualification
    if (currentCompany) candidate.currentCompany = currentCompany
    if (currentCTC) candidate.currentCTC = currentCTC
    if (expectedCTC) candidate.expectedCTC = expectedCTC
    if (currentLocation) candidate.currentLocation = currentLocation
    if (preferredLocation) candidate.preferredLocation = preferredLocation
    if (noticePeriod) candidate.noticePeriod = noticePeriod

    // Handle resume upload
    if (req.file) {
      candidate.resumePath = `/uploads/resumes/${req.file.filename}`
    }

    await candidate.save()

    res.json({ message: 'Profile updated successfully', candidate })
  } catch (error) {
    console.error('Update profile error:', error)
    res
      .status(500)
      .json({ message: 'Error updating profile', error: error.message })
  }
}

module.exports = { getProfile, updateProfile }

const getCandidateApplications = async (req, res) => {
  try {
    const candidateUserId = req.user.id

    const candidate = await Candidate.findOne({
      where: { userId: candidateUserId },
    })
    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' })

    const applications = await Application.findAll({
      where: { candidateId: candidate.id },
      include: [{ model: Recruiter, include: [User] }],
    })

    res.json(applications)
  } catch (error) {
    console.error('Get candidate applications error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching applications', error: error.message })
  }
}

module.exports.getCandidateApplications = getCandidateApplications
