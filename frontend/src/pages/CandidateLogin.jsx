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
        navigate('/admin/dashboard')
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      setErrors({ form: error.response?.data?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Marquee Info Banner */}
      <div className="w-full bg-amber-500/10 border border-amber-500/25 rounded-2xl py-3 px-4 overflow-hidden dark:bg-amber-950/20 dark:border-amber-900/30 shadow-sm animate-slide-up">
        <marquee className="text-xs font-bold text-amber-850 dark:text-amber-400 tracking-wide">
          🚀 Welcome to Aston Recruitment Portal • Active Openings: Senior React Developer, Python Backend Engineer, Node.js Architect, Devops Consultant • Get hired 10x faster with AI profile suitability matching • Next interview batch scheduling begins Monday!
        </marquee>
      </div>

      <div className="min-h-[calc(100vh-140px)] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-12 bg-slate-50/30 dark:bg-slate-950/10 gap-8 rounded-3xl">
        {/* Left side branding banner */}
        <div className="hidden md:flex flex-col max-w-lg text-left space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white leading-tight">
            Aston Recruitment
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Candidate Portal. Track your applications progress in real-time, update qualifications details, and join interactive video meeting rooms.
          </p>
        </div>

        {/* Right side form */}
        <div className="w-full max-w-md">
          <div className="glass-card p-10 shadow-xl border border-slate-100/50 dark:border-slate-800/40">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
              Candidate Login
            </h2>

            {errors.form && <div className="alert-error">{errors.form}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Email or Phone</label>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email or phone"
                  required
                />
              </div>

              <div className="form-group flex items-end gap-3 w-full">
                <div className="flex-1 text-left">
                  <label className="form-label">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <MonkeyPasswordToggle 
                  showPassword={showPassword} 
                  onClick={() => setShowPassword(!showPassword)} 
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring-3 focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-gray-650 dark:text-gray-400">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link
                to="/candidate/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateLogin
