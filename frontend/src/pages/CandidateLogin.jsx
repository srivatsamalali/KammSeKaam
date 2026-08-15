import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import PublicHeader from '../components/PublicHeader'
import { Link } from 'react-router-dom'

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
    <div className="min-h-screen page-shell">
      <PublicHeader />
      <div className="max-w-md mx-auto pt-20 px-4 sm:px-6">
        <div className="glass-card p-10">
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

            <div className="form-group password-field">
              <label className="form-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
