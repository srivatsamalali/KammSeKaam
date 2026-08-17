const { User, Candidate, Recruiter, Notification } = require('../models')
const bcrypt = require('bcryptjs')

const isUserFullyRegistered = (user) => {
  if (!user || !user.password) return false;
  try {
    return !bcrypt.compareSync('temp', user.password);
  } catch (e) {
    return true;
  }
}
const { Op } = require('sequelize')
const { generateToken, generateResetToken } = require('../utils/tokenService')
const { validatePassword, validateEmail } = require('../utils/validators')
const { sendResetPasswordEmail, sendOtpEmail, sendRegistrationSuccessEmail } = require('../utils/emailService')
const { sendOtpToPhone, verifyOtp, resendOtp, generateOtp } = require('../utils/otpService')
const { sendPushNotification } = require('../utils/pushService')

const normalizePhone = (value) =>
  value
    ?.toString()
    .replace(/\s+/g, '')
    .replace(/[^0-9+]/g, '')


const register = async (req, res) => {
  try {
    const { email, phone, password, confirmPassword, name, technicalSkills } = req.body
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
      isUserFullyRegistered(existingEmailUser) &&
      existingEmailUser.phone !== normalizedPhone
    ) {
      return res
        .status(400)
        .json({ message: 'Email already registered. Please login.' })
    }



    // Target user to update (e.g. created during send-otp step) or create new
    let user = existingEmailUser || existingPhoneUser

    if (user) {
      // Update existing temp user with permanent registration details
      user.email = email
      user.phone = normalizedPhone
      user.password = password
      user.role = 'CANDIDATE'
      user.isEmailVerified = true
      user.isPhoneVerified = true
      await user.save()
    } else {
      user = await User.create({
        email,
        phone: normalizedPhone,
        password,
        role: 'CANDIDATE',
        isEmailVerified: true,
        isPhoneVerified: true,
      })
    }

    // Ensure candidate profile exists
    let profile = await Candidate.findOne({ where: { userId: user.id } })
    if (profile) {
      profile.name = name
      profile.mobileNumber = normalizedPhone || ''
      if (technicalSkills) {
        profile.technicalSkills = typeof technicalSkills === 'string' ? JSON.parse(technicalSkills) : technicalSkills
      }
      await profile.save()
    } else {
      await Candidate.create({
        userId: user.id,
        name,
        mobileNumber: normalizedPhone || '',
        address: '',
        technicalSkills: technicalSkills ? (typeof technicalSkills === 'string' ? JSON.parse(technicalSkills) : technicalSkills) : []
      })
    }

    const token = generateToken(user)

    // Send welcome email
    try {
      await sendRegistrationSuccessEmail(user.email, name)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    // Welcome notification for candidate
    try {
      await Notification.create({
        userId: user.id,
        type: 'WELCOME',
        message: 'Welcome to Aston Recruitment! Your registration was successful.',
      })
      await sendPushNotification(user.id, {
        title: 'Welcome to Aston Recruitment',
        body: 'Your registration was successful.',
        type: 'WELCOME',
      })
    } catch (notifErr) {
      console.error('Failed to create candidate welcome notification:', notifErr)
    }

    // Notify all admin users
    try {
      const admins = await User.findAll({ where: { role: 'ADMIN' } })
      for (const admin of admins) {
        await Notification.create({
          userId: admin.id,
          type: 'NEW_REGISTRATION',
          message: `New candidate registered: ${name} (${email})`,
        })
        await sendPushNotification(admin.id, {
          title: 'New Candidate Registered',
          body: `${name} has registered on the portal.`,
          type: 'NEW_REGISTRATION',
        })
      }
    } catch (adminNotifErr) {
      console.error('Failed to notify admins of new registration:', adminNotifErr)
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name },
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
    const { identifier, email, phone, password, role } = req.body
    const rawIdentifier = identifier || email || phone
    const normalizedIdentifier = rawIdentifier?.toString().trim()

    if (!normalizedIdentifier || !password) {
      return res
        .status(400)
        .json({ message: 'Email/phone and password required' })
    }

    let user = null
    if (normalizedIdentifier.includes('@')) {
      user = await User.findOne({ where: { email: normalizedIdentifier } })
    } else {
      // 1. Try to find user by email first
      user = await User.findOne({ where: { email: normalizedIdentifier } })
      
      // 2. Try to find by candidate name
      if (!user) {
        const cand = await Candidate.findOne({ where: { name: normalizedIdentifier } })
        if (cand) {
          user = await User.findByPk(cand.userId)
        }
      }

      // 3. Try to find by recruiter name
      if (!user) {
        const rec = await Recruiter.findOne({ where: { name: normalizedIdentifier } })
        if (rec) {
          user = await User.findByPk(rec.userId)
        }
      }

      // 4. Fallback to phone
      if (!user) {
        user = await User.findOne({ where: { phone: normalizePhone(normalizedIdentifier) } })
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User does not exist' })
    }

    if (role) {
      if (role === 'RECRUITER') {
        if (user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
          return res.status(401).json({ message: 'Invalid recruiter credentials' })
        }
      } else if (user.role !== role) {
        return res.status(401).json({ message: `Invalid ${role.toLowerCase()} credentials` })
      }
    }

    if (user && !isUserFullyRegistered(user)) {
      return res.status(400).json({
        message: 'Your registration is incomplete. Please complete your registration.',
        isIncomplete: true,
        email: user.email,
        phone: user.phone,
      })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    const token = generateToken(user)

    // Fetch associated name
    let name = 'Admin'
    if (user.role === 'CANDIDATE') {
      const cand = await Candidate.findOne({ where: { userId: user.id } })
      if (cand) name = cand.name
    } else if (user.role === 'RECRUITER') {
      const rec = await Recruiter.findOne({ where: { userId: user.id } })
      if (rec) name = rec.name
    }

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name },
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

    user.emailOtp = otp
    user.emailOtpExpiresAt = expiresAt
    await user.save()

    try {
      await sendOtpEmail(email, otp)
    } catch (emailError) {
      console.error('Email error during forgotPassword:', emailError.message)
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 DEVELOPMENT MODE - OTP for', email, ':', otp)
      }
    }

    res.json({
      message: 'OTP sent to your email',
      email,
      ...(process.env.NODE_ENV === 'development' ? { otp } : {}),
    })
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
    if (!user.emailOtp) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP' })
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP' })
    }

    // Check if OTP matches
    if (user.emailOtp !== otp.toString()) {
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
    if (!user.emailOtp || user.emailOtp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    // Update password and clear OTP
    user.password = password
    user.emailOtp = null
    user.emailOtpExpiresAt = null
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

    // Locate user by unique Email identifier
    const existingUser = await User.findOne({
      where: { email }
    })

    if (existingUser) {
      if (isUserFullyRegistered(existingUser)) {
        return res.status(400).json({ message: 'This email is already registered' })
      } else {
        // Temp user exists: update phone to incoming number and allow resume
        existingUser.phone = normalizedPhone
        await existingUser.save()
        return res.json({
          message: 'We found your incomplete registration. Please complete your details below.',
          phone: normalizedPhone,
          resume: true,
        })
      }
    }

    // Email not registered: create temporary user record
    const user = await User.create({
      phone: normalizedPhone,
      email,
      password: 'temp',
      role: 'CANDIDATE',
    })

    // Send OTP
    try {
      await sendOtpToPhone(normalizedPhone, email)
    } catch (otpError) {
      console.error('Failed to send OTP, allowing user to proceed anyway:', otpError)
      return res.json({ 
        message: 'We had trouble sending the verification OTP, but you can proceed anyway.', 
        phone: normalizedPhone, 
        skipOtp: true 
      })
    }

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
    const { phone, email, otp } = req.body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !email || !otp) {
      return res
        .status(400)
        .json({ message: 'Phone, email and OTP are required' })
    }

    const result = await verifyOtp(normalizedPhone, email, otp)

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
