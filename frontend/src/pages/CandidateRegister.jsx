import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService, candidateService } from '../services/api'
import MonkeyPasswordToggle from '../components/MonkeyPasswordToggle'
import JobLoader from '../components/JobLoader'
import { triggerMessageNotification } from '../utils/notification'

const CandidateRegister = () => {
  const navigate = useNavigate()
  const { login, user, loading: authLoading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (location.state && location.state.email && location.state.phone) {
      setEmail(location.state.email)
      
      let rawPhone = location.state.phone
      let code = '+91'
      if (rawPhone.startsWith('+1')) {
        code = '+1'
        rawPhone = rawPhone.substring(2)
      } else if (rawPhone.startsWith('+44')) {
        code = '+44'
        rawPhone = rawPhone.substring(3)
      } else if (rawPhone.startsWith('+61')) {
        code = '+61'
        rawPhone = rawPhone.substring(3)
      } else if (rawPhone.startsWith('+971')) {
        code = '+971'
        rawPhone = rawPhone.substring(4)
      } else if (rawPhone.startsWith('+65')) {
        code = '+65'
        rawPhone = rawPhone.substring(3)
      } else if (rawPhone.startsWith('+91')) {
        code = '+91'
        rawPhone = rawPhone.substring(3)
      }
      setSelectedCountryCode(code)
      setPhone(rawPhone)

      setFormData((prev) => ({
        ...prev,
        email: location.state.email,
        phone: location.state.phone,
      }))

      if (location.state.step) {
        setStep(location.state.step)
      }
      if (location.state.resume) {
        setErrors({ form: 'We found your incomplete registration. Please set your password and complete your profile below.' })
      }
    }
  }, [location])

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

  // Step 1: Phone Verification
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP, 3: Registration
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91')
  const [emailSuggestions, setEmailSuggestions] = useState([])
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Step 3: Registration Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    technicalSkills: [],
    dob: '',
    experience: '',
    highestQualification: '',
    currentCompany: '',
    currentCTC: '',
    expectedCTC: '',
    currentLocation: '',
    preferredLocation: '',
    noticePeriod: '',
  })
  const qualifications = [
    'B.Tech / B.E.',
    'M.Tech',
    'MCA',
    'MBA',
    'B.Sc',
    'M.Sc',
    'BCA',
    'B.Com',
    'Other',
  ]
  const majorCities = ['Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Kolkata']
  const [passwordStrength, setPasswordStrength] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const companiesList = [
    'Tata Consultancy Services (TCS)',
    'Infosys',
    'Wipro',
    'Cognizant',
    'Accenture',
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India (SBI)',
    'Axis Bank',
    'HSBC',
    'Google',
    'Microsoft',
    'Amazon',
    'Meta',
    'Apple',
    'Netflix',
    'Capgemini',
    'Tech Mahindra',
    'HCLTech',
    'LTI-Mindtree',
    'Oracle',
    'Salesforce',
    'IBM',
    'Adobe',
    'Intel',
    'Cisco',
    'NVIDIA',
    'Dell Technologies',
    'HP',
    'JPMorgan Chase',
    'Goldman Sachs',
    'Morgan Stanley',
    'Citi',
    'Deutsche Bank',
    'Standard Chartered',
    'American Express',
    'Flipkart',
    'Paytm',
    'Ola',
    'Uber',
    'Zomato',
  ]
  const [customSkill, setCustomSkill] = useState('')
  const [availableSkills, setAvailableSkills] = useState(['React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'TypeScript'])

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

  const handlePhoneChange = (e) => {
    let val = e.target.value
    let clean = val.replace(/[^\d+]/g, '')
    if (clean.startsWith('+91')) {
      clean = clean.substring(3)
      setSelectedCountryCode('+91')
    } else if (clean.startsWith('+1')) {
      clean = clean.substring(2)
      setSelectedCountryCode('+1')
    } else if (clean.startsWith('+44')) {
      clean = clean.substring(3)
      setSelectedCountryCode('+44')
    } else if (clean.startsWith('+61')) {
      clean = clean.substring(3)
      setSelectedCountryCode('+61')
    }
    while (clean.startsWith('0')) {
      clean = clean.substring(1)
    }
    clean = clean.substring(0, 10)
    setPhone(clean)
    setErrors({})
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    setErrors({})
    if (val && !val.includes('@') && /[a-zA-Z]/.test(val)) {
      setEmailSuggestions(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].map(d => `${val}@${d}`))
    } else {
      setEmailSuggestions([])
    }
  }

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/[^0-9]/g, ''))
    setErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors({})

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!phone.trim()) {
        setErrors({ phone: 'Phone number is required' })
        return
      }
      if (!email.trim()) {
        setErrors({ email: 'Email is required' })
        return
      }

      const normalizedPhone = selectedCountryCode + phone
      const response = await authService.sendOtp({ phone: normalizedPhone, email })
      
      if (response.data && response.data.resume) {
        setFormData((prev) => ({ ...prev, phone: normalizedPhone, email }))
        setStep(3)
        triggerMessageNotification('System', 'We found your incomplete registration. Please complete your password below.')
      } else if (response.data && response.data.skipOtp) {
        setFormData((prev) => ({ ...prev, phone: normalizedPhone, email }))
        setStep(3)
        triggerMessageNotification('System', 'OTP delivery failed. You can complete your details below.')
      } else {
        triggerMessageNotification('System', 'Please check your mailbox for the OTP!')
        setOtpSent(true)
        setOtpTimer(60)
        setStep(2)
      }
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
        return
      }

      const normalizedPhone = selectedCountryCode + phone
      await authService.verifyOtp({ phone: normalizedPhone, email, otp })
      setFormData((prev) => ({ ...prev, phone: normalizedPhone, email }))
      setStep(3)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Invalid OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const normalizedPhone = selectedCountryCode + phone
      triggerMessageNotification('System', 'Please check your mailbox for the OTP!')
      await authService.resendOtp({ phone: normalizedPhone, email })
      setOtpTimer(60)
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Failed to resend OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSkill = (skill) => {
    setFormData(prev => {
      const skills = prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter(s => s !== skill)
        : [...prev.technicalSkills, skill]
      return { ...prev, technicalSkills: skills }
    })
  }

  const handleAddCustomSkill = (e) => {
    e.preventDefault()
    const trimmed = customSkill.trim()
    if (!trimmed) return
    if (!availableSkills.includes(trimmed)) {
      setAvailableSkills(prev => [...prev, trimmed])
    }
    setFormData(prev => {
      if (!prev.technicalSkills.includes(trimmed)) {
        return { ...prev, technicalSkills: [...prev.technicalSkills, trimmed] }
      }
      return prev
    })
    setCustomSkill('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        technicalSkills: formData.technicalSkills,
      })
      login(response.data.user, response.data.token)
      
      // Save additional profile details
      try {
        await candidateService.updateProfile({
          dob: formData.dob,
          experience: formData.experience,
          highestQualification: formData.highestQualification,
          currentCompany: formData.currentCompany,
          currentCTC: formData.currentCTC,
          expectedCTC: formData.expectedCTC,
          currentLocation: formData.currentLocation,
          preferredLocation: formData.preferredLocation,
          noticePeriod: formData.noticePeriod,
          technicalSkills: formData.technicalSkills,
        })
      } catch (profErr) {
        console.error('Error saving profile details during registration:', profErr)
      }

      // Show loader for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/candidate/dashboard')
      }, 3000)
    } catch (error) {
      setLoading(false)
      setErrors({
        form: error.response?.data?.message || 'Registration failed',
      })
    }
  }

  return (
    <div className="min-h-screen page-shell">
      <div className="max-w-md mx-auto pt-20 px-4 sm:px-6">
        <div className="glass-card p-10">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 1 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 2 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 3 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-2 rounded-full ${
                step >= 4 ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            ></div>
          </div>

          {/* Step 1: Phone Verification */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Verify Phone Number
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="form-group text-left">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
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

                <div className="form-group text-left">
                  <label className="form-label">Phone Number</label>
                  <div className="flex items-center gap-2 w-full">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="form-input bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-xs rounded-xl"
                      style={{ width: '85px', minWidth: '85px', flexShrink: 0, paddingRight: '4px', paddingLeft: '8px' }}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="form-input flex-1"
                      placeholder="e.g. 9876543210"
                      required
                      style={{ flexGrow: 1, minWidth: 0 }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <a
                  href="/candidate/login"
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
                Verify OTP
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Enter the 6-digit OTP sent to {email}
              </p>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={handleOtpChange}
                    className="form-input text-center text-3xl tracking-widest"
                    placeholder="000000"
                    required
                  />
                  {errors.otp && (
                    <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="mt-4 text-center">
                {otpTimer > 0 ? (
                  <p className="text-gray-600">
                    Resend OTP in {otpTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setStep(1)
                  setOtp('')
                  setOtpSent(false)
                }}
                className="text-gray-600 hover:text-gray-800 text-sm mt-4 w-full text-center"
              >
                Back
              </button>
            </>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Account Details
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <div className="space-y-4 text-left">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
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
                    className="form-input bg-slate-50 dark:bg-slate-800"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    className="form-input bg-slate-50 dark:bg-slate-800"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <div className="flex items-end gap-3 w-full">
                    <div className="flex-1 text-left">
                      <label className="form-label">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <MonkeyPasswordToggle 
                      showPassword={showPassword} 
                      onClick={() => setShowPassword((prev) => !prev)} 
                    />
                  </div>
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-slate-500">Security Strength</span>
                        <span className={`font-bold ${
                          passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {passwordStrength}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength === 'Weak' ? 'bg-red-500 w-1/3' : passwordStrength === 'Medium' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Min 8 chars, uppercase, lowercase, number, special character
                  </p>
                </div>

                <div className="form-group">
                  <div className="flex items-end gap-3 w-full">
                    <div className="flex-1 text-left">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <MonkeyPasswordToggle 
                      showPassword={showConfirmPassword} 
                      onClick={() => setShowConfirmPassword((prev) => !prev)} 
                    />
                  </div>
                </div>

                <div className="form-group border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                  <label className="form-label font-bold text-slate-800 dark:text-slate-200">
                    Select Technical Skills / Tech Stacks
                  </label>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Choose matching capabilities to power our automatic AI resume suitability index matcher.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/30 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 max-h-36 overflow-y-auto">
                    {availableSkills.map((skill) => {
                      const isChecked = formData.technicalSkills.includes(skill)
                      return (
                        <label 
                          key={skill} 
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-amber-500/10 text-amber-800 border-amber-500/35 dark:text-amber-400 dark:bg-amber-950/20' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-660 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSkill(skill)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span>{skill}</span>
                        </label>
                      )
                    })}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input 
                      type="text"
                      placeholder="Add other skill (e.g. NextJS)"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      className="form-input text-xs h-9 py-1 flex-1"
                    />
                    <button 
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="btn-secondary text-xs h-9 px-4 shrink-0 font-bold"
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name.trim()) {
                      setErrors({ form: 'Full name is required' })
                      return
                    }
                    if (!formData.password || !formData.confirmPassword) {
                      setErrors({ form: 'Password fields are required' })
                      return
                    }
                    if (formData.password !== formData.confirmPassword) {
                      setErrors({ form: 'Passwords do not match' })
                      return
                    }
                    setStep(4)
                  }}
                  className="btn-primary w-full"
                >
                  Next: Add Details
                </button>
              </div>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <a
                  href="/candidate/login"
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </>
          )}

          {/* Step 4: Additional Profile Details Onboarding */}
          {step === 4 && (
            <>
              <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                Onboarding Details
              </h2>

              {errors.form && <div className="alert-error">{errors.form}</div>}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="e.g. 3"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Highest Qualification</label>
                  <select
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleFormChange}
                    className="form-input"
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group relative">
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => {
                      handleFormChange(e)
                      setShowCompanySuggestions(true)
                    }}
                    onFocus={() => setShowCompanySuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowCompanySuggestions(false), 200)
                    }}
                    placeholder="Search or type company manually..."
                    className="form-input"
                    autoComplete="off"
                  />
                  {showCompanySuggestions && (
                    (() => {
                      const query = (formData.currentCompany || '').toLowerCase()
                      const filtered = companiesList.filter(c => c.toLowerCase().includes(query))
                      if (filtered.length === 0) return null
                      return (
                        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                          {filtered.map(company => (
                            <li
                              key={company}
                              onMouseDown={() => {
                                setFormData(prev => ({ ...prev, currentCompany: company }))
                                setShowCompanySuggestions(false)
                              }}
                              className="px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-400 cursor-pointer font-medium transition-colors text-left"
                            >
                              {company}
                            </li>
                          ))}
                        </ul>
                      )
                    })()
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Current CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="currentCTC"
                      value={formData.currentCTC}
                      onChange={handleFormChange}
                      placeholder="e.g. 7.5"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="expectedCTC"
                      value={formData.expectedCTC}
                      onChange={handleFormChange}
                      placeholder="e.g. 11.5"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Current Location</label>
                    <select
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      <option value="">Select Location</option>
                      {majorCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Location</label>
                    <select
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      <option value="">Select Location</option>
                      {majorCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Period (days)</label>
                  <input
                    type="number"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleFormChange}
                    placeholder="e.g. 30"
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-secondary flex-1 py-2 font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-2 font-bold"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
      {loading && <JobLoader text="Completing Registration..." />}
    </div>
  )
}

export default CandidateRegister
