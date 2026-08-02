import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { candidateService } from '../services/api'

const CandidateDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/candidate/login')
    }
  }
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    experience: '',
    technicalSkills: [],
    highestQualification: '',
    currentCompany: '',
    currentCTC: '',
    expectedCTC: '',
    currentLocation: '',
    preferredLocation: '',
    noticePeriod: '',
  })

  useEffect(() => {
    fetchProfile()
    fetchApplications()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await candidateService.getProfile()
      setProfile(response.data)
      setFormData(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await candidateService.getApplications()
      setApplications(res.data)
    } catch (err) {
      console.error('Error fetching candidate applications:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const form = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key !== 'technicalSkills') {
          form.append(key, formData[key])
        }
      })
      form.append('technicalSkills', JSON.stringify(formData.technicalSkills))

      await candidateService.updateProfile(form)
      setEditMode(false)
      fetchProfile()
      alert('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen page-shell">
      {/* Header with Logout */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="w-full mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidate Dashboard
            </h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your profile and track applications
          </p>
        </div>

        {/* Welcome Card */}
        <div className="glass-card mb-8 p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome, {profile?.name}!
          </h3>
          <p className="text-slate-600">
            Complete your profile to get started with your job search.
          </p>
        </div>

        {/* Profile Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Profile</h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="btn-primary"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob ? formData.dob.split('T')[0] : ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Highest Qualification</label>
                  <input
                    type="text"
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current CTC</label>
                  <input
                    type="number"
                    name="currentCTC"
                    value={formData.currentCTC}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected CTC</label>
                  <input
                    type="number"
                    name="expectedCTC"
                    value={formData.expectedCTC}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Location</label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Location</label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Period</label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Save Profile
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.experience || 'Not set'} years
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Current Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.currentLocation || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Current Company</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.currentCompany || 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Applications section */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Your Applications</h3>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet</p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="card mb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Status: {app.status}</p>
                    <p className="text-sm text-gray-600">
                      Recruiter: {app.Recruiter?.name || 'Not assigned'}
                    </p>
                    {app.interviewDate && (
                      <p className="text-sm text-gray-600">
                        Interview:{' '}
                        {new Date(app.interviewDate).toLocaleString()}
                      </p>
                    )}
                    {app.googleMeetLink && (
                      <p className="text-sm">
                        Link:{' '}
                        <a
                          href={app.googleMeetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {app.googleMeetLink}
                        </a>
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateDashboard
