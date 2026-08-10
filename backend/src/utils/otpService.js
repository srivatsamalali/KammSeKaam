const { User } = require('../models')
const { sendOtpEmail } = require('./emailService')

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP to email
const sendOtpToPhone = async (phone, email) => {
  try {
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    // Update user with OTP
    await User.update(
      {
        emailOtp: otp,
        emailOtpExpiresAt: expiresAt,
      },
      {
        where: { phone },
      }
    )

    // Try to send OTP via email
    try {
      await sendOtpEmail(email, otp)
    } catch (emailError) {
      console.error('Email service error:', emailError.message)
      
      // In development, log OTP to console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 DEVELOPMENT MODE - OTP for', email)
        console.log('🔐 OTP:', otp)
        console.log('⏰ Expires in 10 minutes')
        console.log('---')
      } else {
        // In production, still fail
        throw emailError
      }
    }

    return { success: true, message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined }
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw error
  }
}

// Verify OTP
const verifyOtp = async (phone, otp) => {
  try {
    const user = await User.findOne({ where: { phone } })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Check if OTP exists and not expired
    if (!user.emailOtp) {
      return { success: false, message: 'No OTP found. Please request a new OTP' }
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return { success: false, message: 'OTP expired. Please request a new OTP' }
    }

    // Check if OTP matches
    if (user.emailOtp !== otp.toString()) {
      return { success: false, message: 'Invalid OTP' }
    }

    // Mark email and phone as verified and clear OTP
    await user.update({
      isEmailVerified: true,
      isPhoneVerified: true,
      emailOtp: null,
      emailOtpExpiresAt: null,
    })

    return { success: true, message: 'OTP verified successfully' }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}

// Resend OTP
const resendOtp = async (phone, email) => {
  try {
    const user = await User.findOne({ where: { phone } })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Clear old OTP and generate new one
    return await sendOtpToPhone(phone, email)
  } catch (error) {
    console.error('Error resending OTP:', error)
    throw error
  }
}

module.exports = {
  generateOtp,
  sendOtpToPhone,
  verifyOtp,
  resendOtp,
}
