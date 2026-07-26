import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'

const CandidateRegister = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await authService.register(formData)
      login(response.data.user, response.data.token)
      navigate('/candidate/dashboard')
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Registration failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen page-shell">
      <div className="max-w-md mx-auto pt-20 px-4">
        <div className="glass-card p-10">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
            Register as Candidate
          </h2>

          {errors.form && <div className="alert-error">{errors.form}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a
              href="/candidate/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CandidateRegister
