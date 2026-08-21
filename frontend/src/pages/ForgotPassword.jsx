import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import JobLoader from '../components/JobLoader'
import { triggerMessageNotification } from '../utils/notification'

const ForgotPassword = () => {
  const navigate = useNavigate()

  // Steps: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [emailSuggestions, setEmailSuggestions] = useState([])
  const [otp, setOtp] = useState('')
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', ''])
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Ref to digit input elements for programmatic focus control
  const otpInputRefs = useRef([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
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

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!email.trim()) {
        setErrors({ email: 'Email is required' })
        setLoading(false)
        return
      }

      triggerMessageNotification('System', 'Please check your mailbox for the OTP!')
      await authService.forgotPassword(email)
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
        setLoading(false)
        return
      }

      await authService.verifyForgotPasswordOtp({ email, otp })
      setStep(3)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Invalid OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpDigitChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (!cleanValue) return

    const newOtpArray = [...otpArray]
    newOtpArray[index] = cleanValue.substring(cleanValue.length - 1)
    setOtpArray(newOtpArray)
    setErrors({})

    const combinedOtp = newOtpArray.join('')
    setOtp(combinedOtp)

    // Auto-focus next box
    if (index < 5 && cleanValue) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Trigger orbital verification check if fully filled
    if (newOtpArray.every(d => d !== '')) {
      triggerOrbitalVerification(combinedOtp)
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtpArray = [...otpArray]
      
      // If active field is empty, clear preceding and shift focus back
      if (!newOtpArray[index] && index > 0) {
        newOtpArray[index - 1] = ''
        setOtpArray(newOtpArray)
        setOtp(newOtpArray.join(''))
        otpInputRefs.current[index - 1]?.focus()
      } else {
        newOtpArray[index] = ''
        setOtpArray(newOtpArray)
        setOtp(newOtpArray.join(''))
      }
      setErrors({})
    }
  }

  const triggerOrbitalVerification = async (finalOtp) => {
    setIsOrbiting(true)
    setErrors({})

    // Wait 1.2s for orbital spin to complete
    setTimeout(async () => {
      try {
        await authService.verifyForgotPasswordOtp({ email, otp: finalOtp })
        
        setIsVerified(true)
        
        // Wait 850ms for verified checkmark pop animation before moving to step 3
        setTimeout(() => {
          setStep(3)
          setIsOrbiting(false)
          setIsVerified(false)
          setOtpArray(['', '', '', '', '', ''])
        }, 850)

      } catch (error) {
        setIsOrbiting(false)
        setOtpArray(['', '', '', '', '', ''])
        setOtp('')
        setErrors({
          form: error.response?.data?.message || 'Invalid OTP. Please try again.',
        })
      }
    }, 1200)
  }

  const handleResendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      triggerMessageNotification('System', 'Please check your mailbox for the OTP!')
      await authService.forgotPassword(email)
      setOtpTimer(60)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Failed to resend OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!password.trim() || !confirmPassword.trim()) {
        setErrors({ form: 'All fields are required' })
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setErrors({ form: 'Passwords do not match' })
        setLoading(false)
        return
      }

      await authService.resetPasswordWithOtp({ email, otp, password, confirmPassword })
      
      // Show loader for 5 seconds then redirect to login
      setTimeout(() => {
        navigate('/candidate/login')
      }, 5000)
    } catch (error) {
      setLoading(false)
      setErrors({
        form: error.response?.data?.message || 'Failed to reset password',
      })
    }
  }

  return (
    <div className="min-h-screen page-shell">
      <div className="max-w-md mx-auto pt-20 px-4 sm:px-6">
        <div className="glass-card p-10">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 1 ? 'bg-sky-700' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 2 ? 'bg-sky-700' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 3 ? 'bg-sky-700' : 'bg-gray-300'
              }`}
            ></div>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Forgot Password
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="form-group text-left">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value
                      setEmail(val)
                      setErrors({})
                      if (val && !val.includes('@') && /[a-zA-Z]/.test(val)) {
                        setEmailSuggestions(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].map(d => `${val}@${d}`))
                      } else {
                        setEmailSuggestions([])
                      }
                    }}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                  {emailSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 animate-in fade-in duration-200">
                      {emailSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEmail(sug)
                            setEmailSuggestions([])
                          }}
                          className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary w-full ${loading ? 'btn-loading-fill' : ''}`}
                >
                  Send OTP
                </button>
              </form>

              <p className="text-center text-gray-600 mt-4">
                Remember your password?{' '}
                <a
                  href="/candidate/login"
                  className="text-blue-600 font-semibold hover:underline"
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

              <div className="space-y-6">
                {/* Custom Orbital Verification Container */}
                <div className="py-4 relative flex justify-center items-center">
                  <div className={`otp-box-container ${isOrbiting ? 'orbiting' : ''} ${isVerified ? 'verified' : ''}`}>
                    {otpArray.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="otp-digit-box focus:border-[#b88f3f]"
                        disabled={isOrbiting}
                        autoFocus={index === 0}
                      />
                    ))}

                    {isVerified && (
                      <div className="verified-success-badge">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                {otpTimer > 0 ? (
                  <p className="text-gray-600">
                    Resend OTP in {otpTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-800 text-sm mt-4 w-full text-center"
              >
                Back
              </button>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Set New Password
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="form-group password-field">
                  <label className="form-label">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      checkPasswordStrength(e.target.value)
                      setErrors({})
                    }}
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
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors({})
                    }}
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
                  className={`btn-primary w-full ${loading ? 'btn-loading-fill' : ''}`}
                >
                  Reset Password
                </button>
              </form>

              <button
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-800 text-sm mt-4 w-full text-center"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
      {loading && <JobLoader text={step === 3 ? 'Resetting Password...' : 'Processing...'} />}
    </div>
  )
}

export default ForgotPassword
