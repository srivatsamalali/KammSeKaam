const sequelize = require('../config/database')
const { Recruiter, User, Candidate, Application } = require('../models')

const getAllRecruiters = async (req, res) => {
  try {
    // 1. Fetch all users with role RECRUITER
    const recruiterUsers = await User.findAll({
      where: { role: 'RECRUITER' },
    })

    // 2. Ensure each recruiter user has a matching Recruiter profile entry
    for (const u of recruiterUsers) {
      const existingProfile = await Recruiter.findOne({
        where: { userId: u.id },
      })
      if (!existingProfile) {
        const defaultName = u.email ? u.email.split('@')[0] : 'Recruiter'
        await Recruiter.create({
          userId: u.id,
          name: defaultName,
          mobileNumber: '',
          address: '',
          specialization: [],
        })
      }
    }

    // 3. Return all recruiter profiles with User attributes
    const recruiters = await Recruiter.findAll({
      include: [{ model: User, attributes: ['email', 'phone'] }],
      order: [['createdAt', 'DESC']],
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
  const transaction = await sequelize.transaction()
  try {
    const { email, password, name, specialization, mobileNumber, address } = req.body

    if (!email || !password || !name) {
      await transaction.rollback()
      return res
        .status(400)
        .json({ message: 'Email, password, and name are required' })
    }

    // Check if email exists
    const existingUser = await User.findOne({
      where: { email: email.trim() },
      transaction,
    })
    if (existingUser) {
      await transaction.rollback()
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Create user
    const user = await User.create(
      {
        email: email.trim(),
        phone: mobileNumber || null,
        password,
        role: 'RECRUITER',
      },
      { transaction },
    )

    // Parse specialization if string
    let parsedSpecialization = []
    if (Array.isArray(specialization)) {
      parsedSpecialization = specialization
    } else if (typeof specialization === 'string' && specialization.trim()) {
      parsedSpecialization = specialization
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }

    // Create recruiter profile
    const recruiter = await Recruiter.create(
      {
        userId: user.id,
        name: name.trim(),
        mobileNumber: mobileNumber || '',
        address: address || '',
        specialization: parsedSpecialization,
      },
      { transaction },
    )

    await transaction.commit()

    res.status(201).json({
      message: 'Recruiter created successfully',
      recruiter,
    })
  } catch (error) {
    await transaction.rollback()
    console.error('Create recruiter error:', error)
    res.status(500).json({
      message: error.message || 'Error creating recruiter',
      error: error.message,
    })
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
