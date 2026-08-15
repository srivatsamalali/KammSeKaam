import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import { Link } from 'react-router-dom'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const CandidateLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-12 bg-slate-50/30 dark:bg-slate-950/10 gap-8">
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
                placeholder="Enter email or phone number"
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
                  required
                />
              </div>
              <MonkeyPasswordToggle 
                showPassword={showPassword} 
                onClick={() => setShowPassword(!showPassword)} 
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-600">Remember Me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-blue-600 font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
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
  )
}

export default CandidateLogin
