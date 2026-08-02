const express = require('express')
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
  sendOtp,
  verifyPhoneOtp,
  resendPhoneOtp,
} = require('../controllers/authController')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp)
router.post('/reset-password-otp', resetPasswordWithOtp)
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyPhoneOtp)
router.post('/resend-otp', resendPhoneOtp)

module.exports = router
