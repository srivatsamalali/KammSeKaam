import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  recruiterService,
  applicationService,
  notificationService,
} from '../services/api'

const RecruiterDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/recruiter/login')
    }
  }
  const [applications, setApplications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    interviewDate: '',
    googleMeetLink: '',
  })
  const [editingAppId, setEditingAppId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const [editingReason, setEditingReason] = useState('')

  useEffect(() => {
    fetchApplications()
    fetchNotifications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await recruiterService.getApplications()
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll()
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const generateCalMeetLink = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const gen = (len) =>
      Array.from({ length: len }, () =>
        chars[Math.floor(Math.random() * chars.length)],
      ).join('')
    const code = `${gen(3)}-${gen(4)}-${gen(3)}`
    return `https://cal.com/aston-recruitment/interview-${code}`
  }

  const handleOpenScheduleForm = (app) => {
    setSelectedApp(app)
    const initialLink = scheduleData.googleMeetLink || generateCalMeetLink()
    setScheduleData((prev) => ({
      ...prev,
      googleMeetLink: initialLink,
    }))
    setShowScheduleForm(true)
  }

  const handleScheduleInterview = async (applicationId) => {
    try {
      const finalLink = scheduleData.googleMeetLink?.trim() || generateCalMeetLink()
      const payload = {
        ...scheduleData,
        googleMeetLink: finalLink,
      }
      await applicationService.scheduleInterview(applicationId, payload)
      setShowScheduleForm(false)
      setScheduleData({ interviewDate: '', googleMeetLink: '' })
      fetchApplications()
      alert('Interview scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert(error.response?.data?.message || 'Error scheduling interview')
    }
  }
  const handleUpdateStatus = async (applicationId, status, rejectionReason) => {
    let reason = rejectionReason || ''

    if (status === 'REJECTED' && !reason) {
      // If not provided programmatically, prompt the user
      reason = prompt('Enter rejection reason:')
      if (!reason) return
    }

    try {
      await applicationService.updateApplicationStatus(applicationId, {
        status,
        rejectionReason: reason,
      })
      // reset editing UI if present
      if (editingAppId === applicationId) {
        setEditingAppId(null)
        setEditingStatus('')
        setEditingReason('')
      }
      fetchApplications()
      alert('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Error updating status'
      alert(msg)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-emerald-100 text-emerald-800'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800'
      case 'INTERVIEW_SCHEDULED':
        return 'bg-sky-100 text-sky-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen page-shell">
      {/* Header with Logout */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="w-full mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recruiter Dashboard
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Recruiter Dashboard
        </h2>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'applications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Notifications ({notifications.length})
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-gray-600">No applications assigned yet</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {app.Candidate?.name}
                      </h4>
                      <p className="text-gray-600">
                        {app.Candidate?.User?.email}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Experience: {app.Candidate?.experience || 'N/A'} years
                        </p>
                        <p className="text-sm text-gray-600">
                          Location: {app.Candidate?.currentLocation || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.status === 'INTERVIEW_SCHEDULED' && (
                    <div className="mt-4 section-panel p-4">
                      <p className="font-semibold text-blue-900">
                        Interview Details
                      </p>
                      <p className="text-sm text-blue-800">
                        Date: {new Date(app.interviewDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-800">
                        Meet Link:{' '}
                        <a
                          href={app.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {app.googleMeetLink}
                        </a>
                      </p>
                      <div className="mt-3">
                        {editingAppId === app.id ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Update Status
                            </label>
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value)}
                              className="form-input"
                            >
                              <option value="">Select status</option>
                              <option value="INTERVIEW_COMPLETED">
                                Interview Completed
                              </option>
                              <option value="SELECTED">Selected</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                            {editingStatus === 'REJECTED' && (
                              <textarea
                                placeholder="Rejection reason"
                                value={editingReason}
                                onChange={(e) =>
                                  setEditingReason(e.target.value)
                                }
                                className="form-input h-24"
                              />
                            )}
                            <div className="space-x-2">
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    app.id,
                                    editingStatus,
                                    editingReason,
                                  )
                                }
                                className="btn-primary"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAppId(null)
                                  setEditingStatus('')
                                  setEditingReason('')
                                }}
                                className="btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingAppId(app.id)
                              setEditingStatus('INTERVIEW_COMPLETED')
                              setEditingReason('')
                            }}
                            className="btn-warning px-3 py-1"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    {app.status === 'APPLICATION_RECEIVED' && (
                      <>
                        <button
                          onClick={() => {
                            if (showScheduleForm && selectedApp?.id === app.id) {
                              setShowScheduleForm(false)
                            } else {
                              handleOpenScheduleForm(app)
                            }
                          }}
                          className="btn-primary"
                        >
                          Schedule Interview
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="btn-danger px-4 py-2"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'INTERVIEW_SCHEDULED' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(app.id, 'INTERVIEW_COMPLETED')
                          }
                          className="btn-primary"
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                    {app.status === 'INTERVIEW_COMPLETED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                          className="btn-success px-4 py-2"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="btn-danger px-4 py-2"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  {showScheduleForm && selectedApp?.id === app.id && (
                    <div className="mt-4 section-panel p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                      <div className="form-group mb-4">
                        <label className="form-label font-semibold text-slate-800">
                          Interview Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduleData.interviewDate}
                          onChange={(e) => {
                            const newDate = e.target.value
                            setScheduleData((prev) => ({
                              ...prev,
                              interviewDate: newDate,
                              googleMeetLink: prev.googleMeetLink || generateCalMeetLink(),
                            }))
                          }}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="form-label font-semibold text-slate-800">
                            Interview Meeting Link
                          </label>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            📅 Cal.com Auto-Link
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={scheduleData.googleMeetLink}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                googleMeetLink: e.target.value,
                              })
                            }
                            className="form-input flex-1"
                            placeholder="https://cal.com/aston-recruitment/interview-..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setScheduleData((prev) => ({
                                ...prev,
                                googleMeetLink: generateCalMeetLink(),
                              }))
                            }
                            className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors whitespace-nowrap"
                            title="Generate new random Cal.com link"
                          >
                            ⚡ New Cal.com Link
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Auto-generated Cal.com link or paste your custom meeting URL.
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleScheduleInterview(app.id)}
                          className="btn-primary"
                        >
                          Confirm Schedule
                        </button>
                        <button
                          onClick={() => setShowScheduleForm(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-600">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`card ${notif.isRead ? 'opacity-60' : ''}`}
                >
                  <p className="font-semibold text-gray-900">{notif.message}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecruiterDashboard
