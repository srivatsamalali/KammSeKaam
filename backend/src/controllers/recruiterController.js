const { Recruiter, User, Candidate, Application } = require('../models')

const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.findAll({
      include: [{ model: User, attributes: ['email'] }],
    })

    res.json(recruiters)
  } catch (error) {
    console.error('Get recruiters error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching recruiters', error: error.message })
  }
}

const createRecruiter = async (req, res) => {
  try {
    const { email, password, name, specialization } = req.body

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Email, password, and name are required' })
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: 'RECRUITER',
    })

    // Create recruiter profile
    const recruiter = await Recruiter.create({
      userId: user.id,
      name,
      specialization: specialization || [],
    })

    res.status(201).json({
      message: 'Recruiter created successfully',
      recruiter,
    })
  } catch (error) {
    console.error('Create recruiter error:', error)
    res
      .status(500)
      .json({ message: 'Error creating recruiter', error: error.message })
  }
}

const updateRecruiter = async (req, res) => {
  try {
    const { id } = req.params
    const { name, specialization } = req.body

    const recruiter = await Recruiter.findByPk(id)

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' })
    }

    if (name) recruiter.name = name
    if (specialization) recruiter.specialization = specialization

    await recruiter.save()

    res.json({ message: 'Recruiter updated successfully', recruiter })
  } catch (error) {
    console.error('Update recruiter error:', error)
    res
      .status(500)
      .json({ message: 'Error updating recruiter', error: error.message })
  }
}

const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params

    const recruiter = await Recruiter.findByPk(id)

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' })
    }

    // Delete associated user
    await User.destroy({ where: { id: recruiter.userId } })
    await recruiter.destroy()

    res.json({ message: 'Recruiter deleted successfully' })
  } catch (error) {
    console.error('Delete recruiter error:', error)
    res
      .status(500)
      .json({ message: 'Error deleting recruiter', error: error.message })
  }
}

const getRecruiterApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id

    const recruiter = await Recruiter.findOne({
      where: { userId: recruiterId },
    })

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' })
    }

    const applications = await Application.findAll({
      where: { recruiterId: recruiter.id },
      include: [{ model: Candidate, include: [User] }],
    })

    res.json(applications)
  } catch (error) {
    console.error('Get applications error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching applications', error: error.message })
  }
}

module.exports = {
  getAllRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  getRecruiterApplications,
}
