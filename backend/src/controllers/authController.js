const { User, Candidate } = require('../models')
const { Op } = require('sequelize')
const { generateToken, generateResetToken } = require('../utils/tokenService')
const { validatePassword, validateEmail } = require('../utils/validators')
const { sendResetPasswordEmail, sendOtpEmail } = require('../utils/emailService')
const { sendOtpToPhone, verifyOtp, resendOtp, generateOtp } = require('../utils/otpService')

const normalizePhone = (value) =>
  value
    ?.toString()
    .replace(/\s+/g, '')
    .replace(/[^0-9+]/g, '')


const register = async (req, res) => {
  try {
    const { email, phone, password, confirmPassword, name } = req.body
    const normalizedPhone = normalizePhone(phone)

    // Validation
    if (!email || !normalizedPhone || !password || !confirmPassword || !name) {
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

    // Check if user exists by email or phone
    const existingEmailUser = await User.findOne({ where: { email } })
    const existingPhoneUser = await User.findOne({ where: { phone: normalizedPhone } })

    // If a completed user with a real password already exists with this email (not temp)
    if (
      existingEmailUser &&
      existingEmailUser.password &&
      existingEmailUser.password !== 'temp' &&
      existingEmailUser.phone !== normalizedPhone
    ) {
      return res
        .status(400)
        .json({ message: 'Email already registered. Please login.' })
    }

    // If a completed user with a real password already exists with this phone (not temp)
    if (
      existingPhoneUser &&
      existingPhoneUser.password &&
      existingPhoneUser.password !== 'temp' &&
      existingPhoneUser.email !== email
    ) {
      return res
        .status(400)
        .json({ message: 'Phone number already registered with another account.' })
    }

    // Target user to update (e.g. created during send-otp step) or create new
    let user = existingEmailUser || existingPhoneUser

    if (user) {
      // Update existing temp user with permanent registration details
      user.email = email
      user.phone = normalizedPhone
      user.password = password
      user.role = 'CANDIDATE'
      user.isPhoneVerified = true
      await user.save()
    } else {
      user = await User.create({
        email,
        phone: normalizedPhone,
        password,
        role: 'CANDIDATE',
        isPhoneVerified: true,
      })
    }

    // Ensure candidate profile exists
    let profile = await Candidate.findOne({ where: { userId: user.id } })
    if (profile) {
      profile.name = name
      profile.mobileNumber = normalizedPhone || ''
      await profile.save()
    } else {
      await Candidate.create({
        userId: user.id,
        name,
        mobileNumber: normalizedPhone || '',
        address: '',
      })
    }

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
    const { identifier, email, phone, password } = req.body
    const rawIdentifier = identifier || email || phone
    const normalizedIdentifier = rawIdentifier?.toString().trim()

    if (!normalizedIdentifier || !password) {
      return res
        .status(400)
        .json({ message: 'Email/phone and password required' })
    }

    const searchField = normalizedIdentifier.includes('@')
      ? { email: normalizedIdentifier }
      : { phone: normalizePhone(normalizedIdentifier) }
    const user = await User.findOne({ where: searchField })

    if (!user) {
      return res.status(401).json({ message: 'User does not exist' })
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
    const { email, role } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const queryWhere = { email }
    if (role) {
      queryWhere.role = role
    }

    const user = await User.findOne({ where: queryWhere })

    if (!user) {
      if (role) {
        return res.status(404).json({ message: `No ${role.toLowerCase()} account found with this email` })
      }
      return res.status(404).json({ message: 'Email not found in database' })
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    user.phoneOtp = otp
    user.phoneOtpExpiresAt = expiresAt
    await user.save()

    try {
      await sendOtpEmail(email, otp)
    } catch (emailError) {
      console.error('Email error during forgotPassword:', emailError.message)
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 DEVELOPMENT MODE - OTP for', email, ':', otp)
      }
    }

    res.json({ message: 'OTP sent to your email', email })
  } catch (error) {
    console.error('Forgot password error:', error)
    res
      .status(500)
      .json({ message: 'Error processing request', error: error.message })
  }
}

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: 'Email and OTP are required' })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if OTP exists and not expired
    if (!user.phoneOtp) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP' })
    }

    if (new Date() > user.phoneOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP' })
    }

    // Check if OTP matches
    if (user.phoneOtp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    res.json({ message: 'OTP verified successfully', verified: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res
      .status(500)
      .json({ message: 'Error verifying OTP', error: error.message })
  }
}

const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body

    if (!email || !otp || !password || !confirmPassword) {
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

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify OTP one more time
    if (!user.phoneOtp || user.phoneOtp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    if (new Date() > user.phoneOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    // Update password and clear OTP
    user.password = password
    user.phoneOtp = null
    user.phoneOtpExpiresAt = null
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
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

const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !email) {
      return res
        .status(400)
        .json({ message: 'Phone number and email are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Check if phone already exists in a verified user
    const verifiedUser = await User.findOne({
      where: { phone: normalizedPhone, isPhoneVerified: true },
    })

    if (verifiedUser) {
      return res
        .status(400)
        .json({ message: 'This phone number is already registered' })
    }

    // Check if email already exists in a verified user
    const verifiedEmailUser = await User.findOne({
      where: { email, isPhoneVerified: true },
    })

    if (verifiedEmailUser && verifiedEmailUser.phone !== normalizedPhone) {
      return res
        .status(400)
        .json({ message: 'This email is already registered' })
    }

    // Find or create a temporary user
    let user = await User.findOne({ 
      where: { phone: normalizedPhone }
    })

    if (user) {
      // Update email if different (for retry scenarios)
      if (user.email !== email) {
        // Check if this email is used elsewhere
        const emailExists = await User.findOne({ where: { email } })
        if (emailExists && emailExists.id !== user.id) {
          return res.status(400).json({ message: 'This email is already registered' })
        }
        user.email = email
        await user.save()
      }
    } else {
      // Check if email exists before creating new user
      const emailExists = await User.findOne({ where: { email } })
      if (emailExists) {
        return res.status(400).json({ message: 'This email is already registered' })
      }

      user = await User.create({
        phone: normalizedPhone,
        email,
        password: 'temp', // Temporary placeholder, will be set during registration
        role: 'CANDIDATE',
      })
    }

    // Send OTP
    await sendOtpToPhone(normalizedPhone, email)

    res.json({ message: 'OTP sent to your email', phone: normalizedPhone })
  } catch (error) {
    console.error('Send OTP error:', error)
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'field'
      return res.status(400).json({ 
        message: `This ${field} is already registered` 
      })
    }

    res
      .status(500)
      .json({ message: 'Error sending OTP', error: error.message })
  }
}

const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !otp) {
      return res
        .status(400)
        .json({ message: 'Phone number and OTP are required' })
    }

    const result = await verifyOtp(normalizedPhone, otp)

    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    res.json({ message: result.message, verified: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res
      .status(500)
      .json({ message: 'Error verifying OTP', error: error.message })
  }
}

const resendPhoneOtp = async (req, res) => {
  try {
    const { phone, email } = req.body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !email) {
      return res
        .status(400)
        .json({ message: 'Phone number and email are required' })
    }

    const result = await resendOtp(normalizedPhone, email)

    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error('Resend OTP error:', error)
    res
      .status(500)
      .json({ message: 'Error resending OTP', error: error.message })
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
  sendOtp,
  verifyPhoneOtp,
  resendPhoneOtp,
}
