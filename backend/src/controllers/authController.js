const { User, Candidate } = require('../models')
const { generateToken, generateResetToken } = require('../utils/tokenService')
const { validatePassword, validateEmail } = require('../utils/validators')
const { sendResetPasswordEmail } = require('../utils/emailService')

const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Password must contain at least 8 characters, uppercase, lowercase, number, and special character',
      })
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
      role: 'CANDIDATE',
    })

    // Create candidate profile
    await Candidate.create({
      userId: user.id,
      name,
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Email does not exist' })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'Email not found' })
    }

    const resetToken = generateResetToken(user.id)
    await sendResetPasswordEmail(email, resetToken)

    res.json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res
      .status(500)
      .json({ message: 'Error processing request', error: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Password must contain at least 8 characters, uppercase, lowercase, number, and special character',
      })
    }

    const decoded = require('../utils/tokenService').verifyResetToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const user = await User.findByPk(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = password
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    res
      .status(500)
      .json({ message: 'Error processing request', error: error.message })
  }
}

module.exports = { register, login, forgotPassword, resetPassword }
