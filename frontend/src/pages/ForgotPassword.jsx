import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    <div className="auth-page">
      {/* Ambient Golden Aurora Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-[#b88f3f]/20 rounded-full blur-3xl aurora-orb-1 z-0" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl aurora-orb-2 z-0" />

      <div className="auth-page-content">
        <div className="max-w-md w-full relative z-10 mx-auto">
          <div className="auth-card">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2.5 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-[#b88f3f] shadow-[0_0_8px_rgba(184,143,63,0.8)]'
                    : step > s
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white font-serif mb-6">
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
                  className={`btn-primary btn-shimmer w-full bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-wider text-xs shadow-lg cursor-pointer ${loading ? 'btn-loading-fill' : ''}`}
                >
                  Send OTP →
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Remember your password?{' '}
                  <Link
                    to="/candidate/login"
                    className="text-[#b88f3f] font-bold hover:text-[#d4ab59] transition-colors ml-1"
                  >
                    Login →
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white font-serif mb-2">
                Verify OTP
              </h2>
              <p className="text-center text-slate-400 text-xs mb-6">
                Enter the 6-digit OTP sent to <span className="text-[#b88f3f] font-semibold">{email}</span>
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
                  <p className="text-slate-400 text-xs">
                    Resend OTP in <span className="text-[#b88f3f] font-bold">{otpTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#b88f3f] hover:text-[#d4ab59] hover:underline font-bold text-xs cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-200 text-xs mt-4 w-full text-center cursor-pointer"
              >
                ← Back
              </button>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white font-serif mb-6">
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
      </div>

      {/* Anchored Footer */}
      <footer className="auth-footer">
        <div>
          © {new Date().getFullYear()} Aston Recruitment Solutions Ltd. All rights reserved.
        </div>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="text-[#b88f3f]">🔒 256-Bit SSL Encrypted</span>
        </div>
      </footer>
      {loading && <JobLoader text={step === 3 ? 'Resetting Password...' : 'Processing...'} />}
    </div>
  )
}

export default ForgotPassword
