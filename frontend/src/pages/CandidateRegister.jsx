import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import PublicHeader from '../components/PublicHeader'
import JobLoader from '../components/JobLoader'

const CandidateRegister = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Step 1: Phone Verification
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP, 3: Registration
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Step 3: Registration Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('')
      return
    }

    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[@$!%*?&]/.test(password)
    const isLongEnough = password.length >= 8

    const strength = [
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isLongEnough,
    ].filter(Boolean).length

    if (strength <= 2) setPasswordStrength('Weak')
    else if (strength === 3 || strength === 4) setPasswordStrength('Medium')
    else setPasswordStrength('Strong')
  }

  const handlePhoneChange = (e) => {
    setPhone(e.target.value)
    setErrors({})
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setErrors({})
  }

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/[^0-9]/g, ''))
    setErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors({})

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!phone.trim()) {
        setErrors({ phone: 'Phone number is required' })
        return
      }
      if (!email.trim()) {
        setErrors({ email: 'Email is required' })
        return
      }

      await authService.sendOtp({ phone, email })
      setOtpSent(true)
      setOtpTimer(60)
      setStep(2)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Failed to send OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!otp.trim()) {
        setErrors({ otp: 'OTP is required' })
        return
      }

      await authService.verifyOtp({ phone, otp })
      setFormData((prev) => ({ ...prev, phone, email }))
      setStep(3)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Invalid OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await authService.resendOtp({ phone, email })
      setOtpTimer(60)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Failed to resend OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await authService.register(formData)
      login(response.data.user, response.data.token)
      
      // Show loader for 5 seconds before redirecting
      setTimeout(() => {
        navigate('/candidate/dashboard')
      }, 5000)
    } catch (error) {
      setLoading(false)
      setErrors({
        form: error.response?.data?.message || 'Registration failed',
      })
    }
  }

  return (
    <div className="min-h-screen page-shell">
      <PublicHeader />
      <div className="max-w-md mx-auto pt-20 px-4 sm:px-6">
        <div className="glass-card p-10">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 1 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 2 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 3 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
          </div>

          {/* Step 1: Phone Verification */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Verify Phone Number
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <a
                  href="/candidate/login"
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
                Verify OTP
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Enter the 6-digit OTP sent to {email}
              </p>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={handleOtpChange}
                    className="form-input text-center text-3xl tracking-widest"
                    placeholder="000000"
                    required
                  />
                  {errors.otp && (
                    <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="mt-4 text-center">
                {otpTimer > 0 ? (
                  <p className="text-gray-600">
                    Resend OTP in {otpTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setStep(1)
                  setOtp('')
                  setOtpSent(false)
                }}
                className="text-gray-600 hover:text-gray-800 text-sm mt-4 w-full text-center"
              >
                Back
              </button>
            </>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Complete Registration
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group password-field">
                  <label className="form-label">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="password-toggle-button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20.5C7 20.5 2.73 17.28 1 12c.85-2.35 2.46-4.29 4.5-5.56" />
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {passwordStrength && (
                    <p
                      className={`text-sm mt-2 ${
                        passwordStrength === 'Weak'
                          ? 'text-red-600'
                          : passwordStrength === 'Medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      Password Strength: {passwordStrength}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Min 8 chars, uppercase, lowercase, number, special character
                  </p>
                </div>

                <div className="form-group password-field">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="password-toggle-button"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20.5C7 20.5 2.73 17.28 1 12c.85-2.35 2.46-4.29 4.5-5.56" />
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <a
                  href="/candidate/login"
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </>
          )}
        </div>
      </div>
      {loading && <JobLoader text="Completing Registration..." />}
    </div>
  )
}

export default CandidateRegister
