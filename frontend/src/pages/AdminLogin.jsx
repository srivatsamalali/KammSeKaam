import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-12 bg-slate-50/30 dark:bg-slate-950/10 gap-8">
      {/* Left side branding banner */}
      <div className="hidden md:flex flex-col max-w-lg text-left space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white leading-tight">
          Aston Recruitment
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Admin Portal. Manage recruiters, candidate applications, audit interview feedback logs, and configure client partners.
        </p>
      </div>

      {/* Right side form */}
      <div className="w-full max-w-md">
        <div className="glass-card p-10 shadow-xl border border-slate-100/50 dark:border-slate-800/40">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
            Admin Login
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
