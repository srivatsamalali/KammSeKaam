import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const RecruiterLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Login State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
      })

      if (response.data.user.role !== 'RECRUITER') {
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-12 bg-slate-50/30 dark:bg-slate-950/10 gap-8">
      {/* Left side branding banner */}
      <div className="hidden md:flex flex-col max-w-lg text-left space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white leading-tight">
          Aston Recruitment
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Recruiter Portal. Manage assigned candidates, coordinate interviews, rate skill scores, refer files to clients, and chat in real-time.
        </p>
      </div>

      {/* Right side form */}
      <div className="w-full max-w-md">
        <div className="glass-card p-10 shadow-xl border border-slate-100/50 dark:border-slate-800/40">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
            Recruiter Login
          </h2>

          {errors.form && <div className="alert-error">{errors.form}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group flex items-end gap-3 w-full">
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(formData.email)
                      setShowResetModal(true)
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <MonkeyPasswordToggle 
                showPassword={showPassword} 
                onClick={() => setShowPassword(!showPassword)} 
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setResetEmail(formData.email)
                setShowResetModal(true)
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-300 transition-colors"
            >
              🔑 Reset Password
            </button>
            <p className="text-xs text-gray-500">
              Recruiter accounts are managed by Administrator
            </p>
          </div>
        </div>
      </div>

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
                  className="btn-primary w-full"
                >
                  {resetLoading ? 'Verifying DB & Sending OTP...' : 'Send OTP'}
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
                  className="btn-primary w-full"
                >
                  {resetLoading ? 'Verifying OTP...' : 'Verify OTP'}
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
                  className="btn-primary w-full"
                >
                  {resetLoading ? 'Resetting Password...' : 'Reset Password'}
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
