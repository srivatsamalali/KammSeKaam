import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import { Link } from 'react-router-dom'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const CandidateLogin = () => {
  const navigate = useNavigate()
  const { login, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CANDIDATE') {
        navigate('/candidate/dashboard')
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard')
      } else if (user.role === 'ADMIN') {
        navigate('/candidate/dashboard')
      }
    }
  }, [user, authLoading, navigate])

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState([])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let finalValue = type === 'checkbox' ? checked : value

    if (name === 'identifier' && typeof finalValue === 'string') {
      // If it looks like a phone number (i.e. starts with digit or +)
      if (/^[+\d]+$/.test(finalValue)) {
        let clean = finalValue.replace(/[^\d+]/g, '')
        if (clean.startsWith('+91')) {
          clean = clean.substring(3)
        } else if (clean.startsWith('+1')) {
          clean = clean.substring(2)
        } else if (clean.startsWith('+44')) {
          clean = clean.substring(3)
        }
        while (clean.startsWith('0')) {
          clean = clean.substring(1)
        }
        clean = clean.substring(0, 10)
        finalValue = clean
      } else {
        // If it looks like an email prefix
        if (finalValue && !finalValue.includes('@') && /[a-zA-Z]/.test(finalValue)) {
          setEmailSuggestions(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].map(d => `${finalValue}@${d}`))
        } else {
          setEmailSuggestions([])
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await authService.login({
        identifier: formData.identifier,
        password: formData.password,
      })
      login(response.data.user, response.data.token)

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      navigate('/candidate/dashboard')
    } catch (error) {
      const data = error.response?.data
      if (data && data.isIncomplete) {
        navigate('/candidate/register', {
          state: {
            resume: true,
            email: data.email,
            phone: data.phone,
            step: 3
          }
        })
      } else {
        setErrors({ form: data?.message || 'Login failed' })
      }
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
              <span>Aston Candidate Portal</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white font-serif leading-tight">
              QUALITY PEOPLE. <br />
              <span className="gold-text-shimmer">BETTER FUTURES.</span>
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              Welcome to your executive career dashboard. Track applications in real-time, update qualifications, and connect with domain experts.
            </p>

            <div className="space-y-3 pt-2 text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-[#b88f3f] text-lg">✓</span>
                <span>100% Aston Verified™ Opportunities</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#b88f3f] text-lg">✓</span>
                <span>Direct connection with vetted hiring clients</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#b88f3f] text-lg">✓</span>
                <span>End-to-end interview & feedback transparency</span>
              </div>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-lg font-bold text-[#b88f3f] font-serif">100%</div>
                <div className="text-[11px] text-slate-400">Manual Screening</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#b88f3f] font-serif">15+</div>
                <div className="text-[11px] text-slate-400">Partner Clients</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#b88f3f] font-serif">48h</div>
                <div className="text-[11px] text-slate-400">Review SLA</div>
              </div>
            </div>
          </div>

          {/* Right Side Form Card */}
          <div className="w-full max-w-md mx-auto">
            <div className="auth-card">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  Candidate Login
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your credentials to access your dashboard
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
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-[#b88f3f] focus:ring-2 focus:ring-[#b88f3f]/30 transition-all"
                    placeholder="name@example.com or 10-digit mobile"
                    required
                  />
                  {emailSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {emailSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, identifier: sug }))
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

                <div className="flex justify-between items-center text-xs pt-1">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember Me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[#b88f3f] font-bold hover:text-[#d4ab59] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-shimmer w-full mt-4 bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/15 transition-all text-center tracking-wider text-xs uppercase cursor-pointer"
                >
                  {loading ? 'LOGGING IN...' : 'LOGIN TO PORTAL →'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/candidate/register"
                    className="text-[#b88f3f] font-bold hover:text-[#d4ab59] transition-colors ml-1"
                  >
                    Register Now →
                  </Link>
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
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="text-[#b88f3f]">🔒 256-Bit SSL Encrypted</span>
        </div>
      </footer>
    </div>
  )
}

export default CandidateLogin
