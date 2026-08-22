import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CANDIDATE') {
        navigate('/candidate/dashboard')
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard')
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      }
    }
  }, [user, authLoading, navigate])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState([])

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
        role: 'ADMIN',
      })

      if (response.data.user.role !== 'ADMIN') {
        setErrors({ form: 'Invalid admin credentials' })
        return
      }

      login(response.data.user, response.data.token)
      navigate('/admin/dashboard')
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
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
              <span>Aston Executive Administration</span>
            </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white font-serif leading-tight">
            CENTRALIZED. <br />
            <span className="gold-text-shimmer">OPERATIONS SUITE.</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Manage expert interviewers, client hiring requests, candidate pipelines, meeting rooms, and platform analytics.
          </p>

          <div className="space-y-3 pt-2 text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Client request tracking & email workflow automation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Full interview audit logs and candidate scorecards</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Granular role provisioning and permissions</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="auth-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                Admin Console
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative credentials to continue
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
                  Administrator Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-[#b88f3f] focus:ring-2 focus:ring-[#b88f3f]/30 transition-all"
                  placeholder="admin@astonrecruitment.in"
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-[#b88f3f] focus:ring-2 focus:ring-[#b88f3f]/30 transition-all"
                      placeholder="Enter administrator password"
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
                className="btn-primary btn-shimmer w-full mt-4 bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs cursor-pointer"
              >
                {loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN CONSOLE →'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                🔒 Restricted administrative access. All actions are audited.
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
          <span className="hover:text-slate-400 cursor-pointer">Admin Governance</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Audit Logs</span>
          <span>•</span>
          <span className="text-[#b88f3f]">🔒 ISO 27001 Certified System</span>
        </div>
      </footer>
    </div>
  )
}

export default AdminLogin
