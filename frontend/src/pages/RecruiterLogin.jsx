import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const RecruiterLogin = () => {
  const navigate = useNavigate()
  const { login, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CANDIDATE') {
        navigate('/candidate/dashboard')
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard')
      } else if (user.role === 'ADMIN') {
        navigate('/recruiter/dashboard')
      }
    }
  }, [user, authLoading, navigate])

  // Login State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState([])

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'email' && typeof value === 'string') {
      if (value && !value.includes('@') && /[a-zA-Z]/.test(value)) {
        setEmailSuggestions(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].map(d => `${value}@${d}`))
      } else {
        setEmailSuggestions([])
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await authService.login({
        identifier: formData.email,
        email: formData.email,
        password: formData.password,
        role: 'RECRUITER',
      })

      if (response.data.user.role !== 'RECRUITER' && response.data.user.role !== 'ADMIN') {
        setErrors({ form: 'Invalid recruiter credentials' })
        return
      }

      login(response.data.user, response.data.token)
      navigate('/recruiter/dashboard')
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Request OTP for Recruiter
  const handleSendResetOtp = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')

    if (!resetEmail.trim()) {
      setResetError('Recruiter Email is required')
      return
    }

    setResetLoading(true)
    try {
      // Pass 'RECRUITER' role to verify email in DB specifically for recruiter account
      await authService.forgotPassword(resetEmail.trim(), 'RECRUITER')
      setResetSuccess('OTP sent successfully to your email!')
      setOtpTimer(60)
      setResetStep(2)
    } catch (error) {
      setResetError(
        error.response?.data?.message || 'No recruiter account found with this email',
      )
    } finally {
      setResetLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')

    if (!resetOtp.trim()) {
      setResetError('OTP is required')
      return
    }

    setResetLoading(true)
    try {
      await authService.verifyForgotPasswordOtp({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
      })
      setResetSuccess('OTP verified successfully! Set your new password below.')
      setResetStep(3)
    } catch (error) {
      setResetError(error.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setResetLoading(false)
    }
  }

  // Handle Submit New Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')

    if (!newPassword || !confirmNewPassword) {
      setResetError('All fields are required')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match')
      return
    }

    setResetLoading(true)
    try {
      await authService.resetPasswordWithOtp({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        password: newPassword,
        confirmPassword: confirmNewPassword,
      })

      setResetSuccess('Password reset successfully! You can now log in.')
      setFormData((prev) => ({ ...prev, email: resetEmail.trim() }))

      setTimeout(() => {
        setShowResetModal(false)
        setResetStep(1)
        setResetEmail('')
        setResetOtp('')
        setNewPassword('')
        setConfirmNewPassword('')
        setResetSuccess('')
      }, 2000)
    } catch (error) {
      setResetError(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetLoading(false)
    }
  }

  const closeResetModal = () => {
    setShowResetModal(false)
    setResetStep(1)
    setResetEmail('')
    setResetOtp('')
    setNewPassword('')
    setConfirmNewPassword('')
    setResetError('')
    setResetSuccess('')
  }

  return (
    <div className="auth-page">
      {/* Ambient Golden Aurora Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-[#b88f3f]/20 rounded-full blur-3xl aurora-orb-1 z-0" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl aurora-orb-2 z-0" />

      <div className="auth-page-content">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side Branding */}
          <div className="hidden md:flex flex-col text-left space-y-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#b88f3f] text-xs font-bold uppercase tracking-wider backdrop-blur-md w-fit">
              <span>Aston Expert Workspace</span>
            </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white font-serif leading-tight">
            DOMAIN EXPERTS. <br />
            <span className="gold-text-shimmer">EVALUATION SUITE.</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Conduct expert technical interviews, submit scorecards, refer top talent to clients, and collaborate with admin teams in real-time.
          </p>

          <div className="space-y-3 pt-2 text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Structured 3-part evaluation rubric & scoring</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Live video meeting rooms with encrypted audio/video</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Direct client referral pipeline management</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="auth-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                Expert Login
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your recruitment & interview dashboard
              </p>
            </div>

            {errors.form && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-left">
                ⚠️ {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="form-group">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-[#b88f3f] focus:ring-2 focus:ring-[#b88f3f]/30 transition-all"
                  placeholder="expert@astonrecruitment.in"
                  required
                />
                {emailSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {emailSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, email: sug }))
                          setEmailSuggestions([])
                        }}
                        className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(formData.email)
                      setShowResetModal(true)
                    }}
                    className="text-xs font-bold text-[#b88f3f] hover:text-[#d4ab59] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-[#b88f3f] focus:ring-2 focus:ring-[#b88f3f]/30 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <MonkeyPasswordToggle 
                    showPassword={showPassword} 
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary btn-shimmer w-full mt-4 bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs cursor-pointer ${loading ? 'btn-loading-fill' : ''}`}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN TO WORKSPACE →'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                Recruiter & Expert credentials are provisioned by Administrator
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anchored Footer */}
      <footer className="auth-footer">
        <div>
          © {new Date().getFullYear()} Aston Recruitment Solutions Ltd. All rights reserved.
        </div>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Expert Guidelines</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
          <span>•</span>
          <span className="text-[#b88f3f]">🔒 256-Bit Encrypted Workspace</span>
        </div>
      </footer>

      {/* Recruiter Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-100 relative">
            <button
              type="button"
              onClick={closeResetModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Recruiter Password Reset
            </h3>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6 border-b pb-3 text-xs font-semibold">
              <span
                className={
                  resetStep >= 1 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }
              >
                1. Email Check
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={
                  resetStep >= 2 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }
              >
                2. Verify OTP
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={
                  resetStep >= 3 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }
              >
                3. Reset
              </span>
            </div>

            {resetError && (
              <div className="alert-error text-sm mb-4">{resetError}</div>
            )}
            {resetSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm mb-4">
                {resetSuccess}
              </div>
            )}

            {/* STEP 1: Enter & Verify Email in DB */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter your recruiter email. We will check the database to verify your account and send an OTP.
                </p>
                <div className="form-group">
                  <label className="form-label">Recruiter Email ID</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="recruiter@astonrecruitment.in"
                    className="form-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`btn-primary w-full ${resetLoading ? 'btn-loading-fill' : ''}`}
                >
                  Send OTP
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter the 6-digit OTP sent to <strong>{resetEmail}</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="123456"
                    className="form-input text-center text-xl tracking-widest"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`btn-primary w-full ${resetLoading ? 'btn-loading-fill' : ''}`}
                >
                  Verify OTP
                </button>
                <div className="flex justify-between items-center text-xs mt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-slate-500 hover:text-slate-700 underline"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={otpTimer > 0 || resetLoading}
                    onClick={handleSendResetOtp}
                    className="text-blue-600 font-semibold disabled:text-slate-400"
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {resetStep === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Create a new password for your recruiter account.
                </p>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 chars (A-Z, a-z, 0-9, special)"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="form-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`btn-primary w-full ${resetLoading ? 'btn-loading-fill' : ''}`}
                >
                  Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RecruiterLogin
