import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  adminService,
  recruiterService,
  applicationService,
} from '../services/api'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/admin/login')
    }
  }
  const [stats, setStats] = useState(null)
  const [recruiters, setRecruiters] = useState([])
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [unassignedCandidates, setUnassignedCandidates] = useState([])
  const [editingStatusMap, setEditingStatusMap] = useState({})
  const [editingReasonMap, setEditingReasonMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false)
  const [recruiterForm, setRecruiterForm] = useState({
    email: '',
    password: '',
    name: '',
    mobileNumber: '',
    specialization: [],
  })
  const [editingRecruiterId, setEditingRecruiterId] = useState(null)
  const [editingForm, setEditingForm] = useState({
    name: '',
    specialization: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, recruitersRes, appsRes] = await Promise.all([
        adminService.getDashboardStats(),
        recruiterService.getAll(),
        adminService.getReports(),
      ])
      setStats(statsRes.data)
      setRecruiters(recruitersRes.data)
      setApplications(appsRes.data)
      // fetch candidates
      try {
        const candRes = await adminService.getCandidates()
        setCandidates(candRes.data)
      } catch (e) {
        console.error('Error fetching candidates:', e)
      }
      // fetch unassigned candidates separately
      try {
        const ua = await adminService.getUnassignedCandidates()
        setUnassignedCandidates(ua.data)
      } catch (e) {
        console.error('Error fetching unassigned candidates:', e)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecruiter = async (e) => {
    e.preventDefault()
    try {
      await recruiterService.create(recruiterForm)
      setRecruiterForm({
        email: '',
        password: '',
        name: '',
        mobileNumber: '',
        specialization: [],
      })
      setShowCreateRecruiter(false)
      fetchData()
      alert('Recruiter created successfully')
    } catch (error) {
      console.error('Error creating recruiter:', error)
      const msg = error.response?.data?.message || error.message || 'Error creating recruiter'
      alert(msg)
    }
  }

  const handleDeleteRecruiter = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await recruiterService.delete(id)
        fetchData()
        alert('Recruiter deleted successfully')
      } catch (error) {
        console.error('Error deleting recruiter:', error)
        alert('Error deleting recruiter')
      }
    }
  }

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate? This will delete their user profile and all applications.')) {
      try {
        await adminService.deleteCandidate(id)
        fetchData()
        alert('Candidate deleted successfully')
      } catch (error) {
        console.error('Error deleting candidate:', error)
        alert('Error deleting candidate')
      }
    }
  }

  const exportApplicationsToCSV = () => {
    try {
      const headers = ['Candidate Name', 'Candidate Email', 'Recruiter Name', 'Application Status', 'Applied Date', 'Interview Date', 'Meeting Link'];
      
      const rows = applications.map(app => [
        app.Candidate?.name || 'N/A',
        app.Candidate?.User?.email || 'N/A',
        app.Recruiter?.name || 'Not assigned',
        app.status || 'N/A',
        new Date(app.createdAt).toLocaleDateString(),
        app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'N/A',
        app.googleMeetLink || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kaamsekaaam_applications_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV report');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen page-shell">
      {/* Header with Logout */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-600">{user?.email || 'Contact@astonrecruitment.in'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Logout</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-6">
            <p className="text-sm text-slate-500">Total Candidates</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats?.totalCandidates || 0}
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-slate-500">Total Recruiters</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats?.totalRecruiters || 0}
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats?.totalApplications || 0}
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-slate-500">Selected</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats?.selectedCandidates || 0}
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats?.rejectedCandidates || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'recruiters'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Recruiters
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'candidates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'applications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Applications
          </button>
        </div>

        {/* Recruiters Tab */}
        {activeTab === 'recruiters' && (
          <div>
            <button
              onClick={() => setShowCreateRecruiter(!showCreateRecruiter)}
              className="btn-primary mb-6"
            >
              {showCreateRecruiter ? 'Cancel' : 'Create New Recruiter'}
            </button>

            {showCreateRecruiter && (
              <form onSubmit={handleCreateRecruiter} className="card mb-6">
                <h3 className="text-lg font-bold mb-4">Create New Recruiter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={recruiterForm.name}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          name: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={recruiterForm.email}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          email: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={recruiterForm.password}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          password: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={recruiterForm.mobileNumber}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          mobileNumber: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Specialization (comma separated)
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.specialization.join(', ')}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          specialization: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Create Recruiter
                </button>
              </form>
            )}

            <div className="space-y-4">
              {recruiters.length === 0 ? (
                <p className="text-gray-600">No recruiters yet</p>
              ) : (
                recruiters.map((rec) => (
                  <div
                    key={rec.id}
                    className="card flex justify-between items-start"
                  >
                    <div>
                      {editingRecruiterId === rec.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingForm.name}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                name: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                          <input
                            type="text"
                            value={editingForm.specialization}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                specialization: e.target.value,
                              })
                            }
                            placeholder="comma separated skills"
                            className="form-input"
                          />
                          <div className="space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const specArray = editingForm.specialization
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                  await recruiterService.update(rec.id, {
                                    name: editingForm.name,
                                    specialization: specArray,
                                  })
                                  setEditingRecruiterId(null)
                                  fetchData()
                                  alert('Recruiter updated')
                                } catch (e) {
                                  console.error('Error updating recruiter', e)
                                  alert('Update failed')
                                }
                              }}
                              className="btn-primary"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRecruiterId(null)}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-gray-900">
                            {rec.name}
                          </h4>
                          <p className="text-gray-600">{rec.User?.email}</p>
                          <p className="text-sm text-gray-600">
                            Specialization:{' '}
                            {rec.specialization?.join(', ') || 'Not set'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="space-x-2">
                      {editingRecruiterId !== rec.id && (
                        <button
                          onClick={() => {
                            setEditingRecruiterId(rec.id)
                            setEditingForm({
                              name: rec.name || '',
                              specialization: (rec.specialization || []).join(
                                ', ',
                              ),
                            })
                          }}
                          className="btn-warning px-4 py-2"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecruiter(rec.id)}
                        className="btn-danger px-4 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <p className="text-gray-600">No candidates found</p>
            ) : (
              candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="card flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {cand.name || 'No Name'}
                    </h4>
                    <p className="text-gray-600">{cand.User?.email || 'No email'}</p>
                    {cand.mobileNumber && (
                      <p className="text-sm text-gray-600">
                        Phone: {cand.mobileNumber}
                      </p>
                    )}
                    {cand.technicalSkills && (
                      <p className="text-sm text-gray-600">
                        Skills: {cand.technicalSkills}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteCandidate(cand.id)}
                      className="btn-danger px-4 py-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-900">Applications Status Reports</h3>
              {applications.length > 0 && (
                <button
                  onClick={exportApplicationsToCSV}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  📥 Export to CSV
                </button>
              )}
            </div>
            {/* Unassigned candidates section */}
            {unassignedCandidates.length > 0 && (
              <div className="card mb-4">
                <h3 className="text-lg font-bold mb-2">
                  Unassigned Candidates
                </h3>
                <div className="space-y-3">
                  {unassignedCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-600">{c.User?.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select id={`rec-${c.id}`} className="form-input">
                          <option value="">Select recruiter</option>
                          {recruiters.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={async (e) => {
                            const select = document.getElementById(
                              `rec-${c.id}`,
                            )
                            const recruiterId = select.value
                            if (!recruiterId) return alert('Select a recruiter')
                            try {
                              await applicationService.assign({
                                candidateId: c.id,
                                recruiterId,
                              })
                              alert('Assigned successfully!')
                              fetchData()
                            } catch (err) {
                              console.error('Assign error', err)
                              const msg = err.response?.data?.message || err.message || 'Assign failed'
                              alert(msg)
                            }
                          }}
                          className="btn-primary"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {applications.length === 0 ? (
              <p className="text-gray-600">No applications</p>
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
                      <p className="text-sm text-gray-600 mt-2">
                        Recruiter: {app.Recruiter?.name || 'Not assigned'}
                      </p>
                      {app.interviewDate && (
                        <div className="mt-3 section-panel p-4">
                          <p className="text-sm font-semibold text-slate-900">
                            Interview Details
                          </p>
                          <p className="text-sm text-slate-600">
                            Date: {new Date(app.interviewDate).toLocaleString()}
                          </p>
                          {app.googleMeetLink && (
                            <p className="text-sm text-slate-600">
                              Link:{' '}
                              <a
                                href={app.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                {app.googleMeetLink}
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {app.status}
                      </span>

                      <div className="mt-3">
                        <select
                          value={editingStatusMap[app.id] ?? ''}
                          onChange={(e) =>
                            setEditingStatusMap((s) => ({
                              ...s,
                              [app.id]: e.target.value,
                            }))
                          }
                          className="form-input mb-2"
                        >
                          <option value="">-- Override status --</option>
                          <option value="APPLICATION_RECEIVED">
                            APPLICATION_RECEIVED
                          </option>
                          <option value="INTERVIEW_SCHEDULED">
                            INTERVIEW_SCHEDULED
                          </option>
                          <option value="INTERVIEW_COMPLETED">
                            INTERVIEW_COMPLETED
                          </option>
                           <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="SENT_TO_CLIENT">SENT_TO_CLIENT</option>
                        </select>

                        {editingStatusMap[app.id] === 'REJECTED' && (
                          <textarea
                            placeholder="Rejection reason"
                            value={editingReasonMap[app.id] ?? ''}
                            onChange={(e) =>
                              setEditingReasonMap((r) => ({
                                ...r,
                                [app.id]: e.target.value,
                              }))
                            }
                            className="form-input mb-2 h-20"
                          />
                        )}

                        <div className="space-x-2">
                          <button
                            onClick={async () => {
                              const status = editingStatusMap[app.id]
                              const reason = editingReasonMap[app.id]
                              if (!status)
                                return alert('Select a status to override')
                              try {
                                await adminService.overrideStatus(app.id, {
                                  status,
                                  rejectionReason:
                                    status === 'REJECTED' ? reason : undefined,
                                })
                                alert('Status overridden')
                                setEditingStatusMap((s) => ({
                                  ...s,
                                  [app.id]: '',
                                }))
                                setEditingReasonMap((r) => ({
                                  ...r,
                                  [app.id]: '',
                                }))
                                fetchData()
                              } catch (err) {
                                console.error('Override error', err)
                                alert(
                                  err.response?.data?.message ||
                                    'Error overriding status',
                                )
                              }
                            }}
                            className="btn-primary"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
