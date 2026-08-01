import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  recruiterService,
  applicationService,
  notificationService,
} from '../services/api'

const RecruiterDashboard = () => {
  const { user, logout } = useAuth()
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

  const handleScheduleInterview = async (applicationId) => {
    try {
      await applicationService.scheduleInterview(applicationId, scheduleData)
      setShowScheduleForm(false)
      setScheduleData({ interviewDate: '', googleMeetLink: '' })
      fetchApplications()
      alert('Interview scheduled successfully')
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Error scheduling interview')
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
                            setSelectedApp(app)
                            setShowScheduleForm(!showScheduleForm)
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
                    <div className="mt-4 section-panel p-4">
                      <div className="form-group">
                        <label className="form-label">
                          Interview Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduleData.interviewDate}
                          onChange={(e) =>
                            setScheduleData({
                              ...scheduleData,
                              interviewDate: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Google Meet Link</label>
                        <input
                          type="url"
                          value={scheduleData.googleMeetLink}
                          onChange={(e) =>
                            setScheduleData({
                              ...scheduleData,
                              googleMeetLink: e.target.value,
                            })
                          }
                          className="form-input"
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                      <button
                        onClick={() => handleScheduleInterview(app.id)}
                        className="btn-primary mr-2"
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
