import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  recruiterService,
  applicationService,
  notificationService,
  messageService,
  clientService,
} from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import { triggerMessageNotification } from '../utils/notification'
import ChatThreadPanel from '../components/ChatThreadPanel'

export const InterviewCountdown = ({ date }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const target = new Date(date).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0 && Math.abs(diff) < 90 * 60 * 1000) {
        setIsLive(true)
        setTimeLeft('LIVE - Happening Now')
        return
      }

      if (diff < 0) {
        setIsLive(false)
        setTimeLeft('Passed')
        return
      }

      setIsLive(false)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      let timeString = ''
      if (days > 0) timeString += `${days}d `
      if (hours > 0 || days > 0) timeString += `${hours}h `
      timeString += `${minutes}m ${seconds}s`

      setTimeLeft(timeString)
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [date])

  if (timeLeft === 'Passed') return null

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${isLive
      ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
      : 'bg-amber-50 text-amber-800 border border-amber-200'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-amber-600 animate-pulse'}`} />
      <span>{isLive ? '' : 'In: '}{timeLeft}</span>
    </div>
  )
}

const parseSkills = (technicalSkills) => {
  if (!technicalSkills) return []
  if (Array.isArray(technicalSkills)) return technicalSkills
  if (typeof technicalSkills === 'string') {
    try {
      const parsed = JSON.parse(technicalSkills)
      return parseSkills(parsed)
    } catch (e) {
      return technicalSkills.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

const calculateAiMatch = (candidate) => {
  if (!candidate) return { score: 0, strengths: [] }
  let score = 65
  const strengths = []

  const skills = parseSkills(candidate.technicalSkills)

  if (skills.length > 0) {
    score += Math.min(skills.length * 7, 20)
    strengths.push(`Core skills: ${skills.slice(0, 2).join(', ')}`)
  } else {
    score -= 10;
  }

  const exp = parseInt(candidate.experience, 10) || 0
  if (exp >= 5) {
    score += 12
    strengths.push('Senior capability (5+ yrs)')
  } else if (exp >= 2) {
    score += 6
    strengths.push('Mid-level experience')
  } else {
    strengths.push('Entry level profile')
  }

  if (candidate.highestQualification) {
    strengths.push(`Degree: ${candidate.highestQualification}`)
  }

  return {
    score: Math.min(score, 97),
    strengths: strengths.slice(0, 3)
  }
}

const CalendarButton = ({ interviewDate, googleMeetLink }) => {
  const [showOptions, setShowOptions] = useState(false);

  if (!interviewDate) return null;

  const dateObj = new Date(interviewDate);
  const startDate = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
  const endDate = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Aston+Recruitment+Interview&dates=${startDate}/${endDate}&details=Google+Meet+Link:+${encodeURIComponent(googleMeetLink || 'Will be provided')}&location=Online`;

  const downloadIcs = () => {
    const formattedStart = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const formattedEnd = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:${googleMeetLink || ''}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      'SUMMARY:Interview with Aston Recruitment',
      `DESCRIPTION:Google Meet Link: ${googleMeetLink || 'TBD'}`,
      'LOCATION:Online',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'interview.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative inline-block text-left mt-2">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold hover:bg-amber-600 transition-all flex items-center gap-1"
      >
        📅 Add to Calendar
      </button>
      {showOptions && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
          <div className="absolute left-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <a
                href={googleUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowOptions(false)}
                className="block px-4 py-2 text-[10px] text-gray-700 hover:bg-gray-100 font-semibold"
              >
                Google Calendar
              </a>
              <button
                onClick={() => {
                  downloadIcs();
                  setShowOptions(false);
                }}
                className="w-full text-left block px-4 py-2 text-[10px] text-gray-700 hover:bg-gray-100 font-semibold"
              >
                Download .ics file
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ChatPanel = ({ applicationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, applicationId]);

  const loadMessages = async () => {
    try {
      const res = await messageService.getMessages(applicationId);
      const incoming = res.data;
      if (messages.length > 0 && incoming.length > messages.length) {
        const newlyAdded = incoming.slice(messages.length);
        newlyAdded.forEach((msg) => {
          if (msg.senderId !== user?.id) {
            triggerMessageNotification('Candidate', msg.message);
          }
        });
      }
      setMessages(incoming);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await messageService.sendMessage(applicationId, { message: newMessage });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border border-amber-200 rounded-xl overflow-hidden bg-white/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-bold flex justify-between items-center transition-all"
      >
        <span>💬 Chat with Candidate</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="p-4 flex flex-col h-64 bg-white">
          <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-1">
            {messages.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-8 font-semibold">No messages yet. Send a message to coordinate!</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs ${isMe
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5 font-semibold">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const RecruiterDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null })

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to logout?',
      onConfirm: () => {
        logout()
        navigate('/recruiter/login')
      }
    })
  }
  const [applications, setApplications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications')
  const [isKanbanView, setIsKanbanView] = useState(false)
  const [activeChatAppId, setActiveChatAppId] = useState(null)
  const [activeChatCandidateName, setActiveChatCandidateName] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    interviewDate: '',
    googleMeetLink: '',
    interviewDuration: 60,
  })
  const [editingAppId, setEditingAppId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const [editingReason, setEditingReason] = useState('')
  const [technicalRating, setTechnicalRating] = useState(5)
  const [communicationRating, setCommunicationRating] = useState(5)
  const [culturalRating, setCulturalRating] = useState(5)
  const [recommendation, setRecommendation] = useState('Hire')
  const [feedbackComments, setFeedbackComments] = useState('')

  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')

  const [adminUsers, setAdminUsers] = useState([])
  const [editingRecruiterId, setEditingRecruiterId] = useState(null)
  const [editingForm, setEditingForm] = useState({ name: '', specialization: '' })
  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false)
  const [recruiterForm, setRecruiterForm] = useState({
    email: '',
    password: '',
    name: '',
    mobileNumber: '',
    specialization: [],
  })

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
      fetchAdminUsers()
      alert('Recruiter created successfully')
    } catch (error) {
      console.error('Error creating recruiter:', error)
      alert(error.response?.data?.message || 'Error creating recruiter')
    }
  }

  const fetchAdminUsers = async () => {
    try {
      const recruitersRes = await recruiterService.getAll()
      setAdminUsers(recruitersRes.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching recruiters for admin:', error)
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this recruiter? This will delete their user profile.',
      onConfirm: async () => {
        try {
          await recruiterService.delete(id)
          alert('Recruiter deleted successfully')
          fetchAdminUsers()
        } catch (error) {
          console.error('Error deleting recruiter:', error)
          alert('Error deleting recruiter')
        }
      }
    })
  }

  const handleUpdateRecruiter = async (id) => {
    try {
      const specArray = editingForm.specialization
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await recruiterService.update(id, {
        name: editingForm.name,
        specialization: specArray,
      })
      setEditingRecruiterId(null)
      alert('Recruiter updated successfully')
      fetchAdminUsers()
    } catch (error) {
      console.error('Error updating recruiter:', error)
      alert('Update failed')
    }
  }

  const [selectedClientMap, setSelectedClientMap] = useState({})

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchAdminUsers()
    } else {
      fetchApplications()
      fetchNotifications()
      fetchClients()
    }
  }, [user])

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname)

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname)
      setConfirmModal({
        isOpen: true,
        message: 'You are about to logout. Are you sure you want to leave?',
        onConfirm: () => {
          logout()
          navigate('/recruiter/login')
        }
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [logout, navigate])

  const fetchClients = async () => {
    try {
      const response = await clientService.getAll()
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

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
    const frontendUrl = window.location.origin
    return `${frontendUrl}/meeting/${code}`
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
      setScheduleData({ interviewDate: '', googleMeetLink: '', interviewDuration: 60 })
      fetchApplications()
      alert('Interview scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert(error.response?.data?.message || 'Error scheduling interview')
    }
  }
  const handleUpdateStatus = async (applicationId, status, extraData = {}) => {
    let reason = extraData.rejectionReason || ''

    if (status === 'REJECTED' && !reason) {
      reason = prompt('Enter rejection reason:')
      if (!reason) return
    }

    try {
      await applicationService.updateApplicationStatus(applicationId, {
        status,
        rejectionReason: reason,
        ...extraData,
      })
      if (editingAppId === applicationId) {
        setEditingAppId(null)
        setEditingStatus('')
        setEditingReason('')
        setTechnicalRating(5)
        setCommunicationRating(5)
        setCulturalRating(5)
        setRecommendation('Hire')
        setFeedbackComments('')
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
      case 'SENT_TO_CLIENT':
        return 'bg-amber-100 text-amber-800'
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      {user?.role === 'ADMIN' ? (
        <div className="w-full mx-auto px-4 py-8 animate-slide-up">
          <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl mb-6">
            <div>
              <h2 className="text-2xl font-bold">Admin Sandbox: Recruiter Portals view</h2>
              <p className="text-xs text-slate-400">Viewing and managing recruiters registered in the system</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateRecruiter(!showCreateRecruiter)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
              >
                {showCreateRecruiter ? 'Cancel' : 'Create New Recruiter'}
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
              >
                ← Back to Admin Console
              </button>
            </div>
          </div>

          {showCreateRecruiter && (
            <form onSubmit={handleCreateRecruiter} className="glass-card p-6 mb-6 text-left border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Recruiter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={recruiterForm.name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={recruiterForm.email}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={recruiterForm.password}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, password: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={recruiterForm.mobileNumber}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, mobileNumber: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">Specialization (comma separated)</label>
                  <input
                    type="text"
                    value={recruiterForm.specialization.join(', ')}
                    onChange={(e) => setRecruiterForm({
                      ...recruiterForm,
                      specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="form-input"
                    placeholder="React, Java, Node.js"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary mt-4">
                Create Recruiter
              </button>
            </form>
          )}

          <div className="glass-card overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold border-b border-slate-250 dark:border-slate-750">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Specialization / Skills</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400">No recruiters registered</td>
                    </tr>
                  ) : (
                    adminUsers.map((rec, index) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors animate-in fade-in duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          {editingRecruiterId === rec.id ? (
                            <input
                              type="text"
                              value={editingForm.name}
                              onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                              className="form-input text-xs"
                            />
                          ) : (
                            <span className="font-bold text-slate-900 dark:text-white">{rec.name || 'N/A'}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{rec.User?.email || 'N/A'}</td>
                        <td className="p-4">
                          {editingRecruiterId === rec.id ? (
                            <input
                              type="text"
                              value={editingForm.specialization}
                              onChange={(e) => setEditingForm({ ...editingForm, specialization: e.target.value })}
                              placeholder="comma separated specialization"
                              className="form-input text-xs"
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {(rec.specialization || []).map((spec, sIdx) => (
                                <span key={sIdx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 text-[10px] rounded font-bold border border-blue-200/20">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {editingRecruiterId === rec.id ? (
                            <div className="flex justify-center gap-2">
                              <button
                                  onClick={() => handleUpdateRecruiter(rec.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRecruiterId(null)}
                                className="px-3 py-1.5 bg-slate-150 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingRecruiterId(rec.id);
                                  setEditingForm({
                                    name: rec.name || '',
                                    specialization: (rec.specialization || []).join(', ')
                                  });
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(rec.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full mx-auto px-4 py-8">

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Recruiter Dashboard
        </h2>

        {/* Upcoming Interviews Reminder Banner */}
        {applications.filter(app => app.status === 'INTERVIEW_SCHEDULED' && app.interviewDate).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm dark:bg-amber-950/20 dark:border-amber-900/30">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-3">
              Upcoming Scheduled Interviews
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications
                .filter(app => app.status === 'INTERVIEW_SCHEDULED' && app.interviewDate)
                .map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">
                        {app.Candidate?.name || 'Candidate'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        {new Date(app.interviewDate).toLocaleString()}
                        <InterviewCountdown date={app.interviewDate} />
                      </p>
                      {app.interviewDuration && (
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                          ⏱️ Duration: {app.interviewDuration} Mins
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">
                        Email: {app.Candidate?.User?.email || 'N/A'}
                      </p>
                    </div>
                    {app.googleMeetLink && (
                      <a
                        href={app.googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Join Interview Room
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold ${activeTab === 'applications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
              }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 font-semibold ${activeTab === 'notifications'
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
            <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Recruit Pipeline Layout</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsKanbanView(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    !isKanbanView 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setIsKanbanView(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    isKanbanView 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Kanban Board
                </button>
              </div>
            </div>

            {isKanbanView ? (
              <div className="flex overflow-x-auto gap-4 pb-6 min-h-[500px]">
                {[
                  { key: 'APPLICATION_RECEIVED', label: 'Received' },
                  { key: 'INTERVIEW_SCHEDULED', label: 'Scheduled' },
                  { key: 'INTERVIEW_COMPLETED', label: 'Completed' },
                  { key: 'SENT_TO_CLIENT', label: 'Client Review' },
                  { key: 'SELECTED', label: 'Selected' },
                  { key: 'REJECTED', label: 'Rejected' }
                ].map((stage) => {
                  const stageApps = applications.filter(app => app.status === stage.key)
                  return (
                    <div key={stage.key} className="w-80 shrink-0 bg-slate-50/40 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col h-full max-h-[700px]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">{stage.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/65 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold">{stageApps.length}</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {stageApps.length === 0 ? (
                          <div className="text-center py-8 text-[10px] text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            Empty stage
                          </div>
                        ) : (
                          stageApps.map((app) => {
                            const aiData = calculateAiMatch(app.Candidate)
                            return (
                              <div key={app.id} className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">{app.Candidate?.name}</h5>
                                    <p className="text-[9px] text-slate-450 mt-0.5 truncate max-w-[150px]">{app.Candidate?.User?.email}</p>
                                  </div>
                                  <div className="relative w-8 h-8 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                      <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="none"
                                        stroke="#b88f3f"
                                        strokeWidth="3"
                                        strokeDasharray={`${aiData.score} ${100 - aiData.score}`}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-amber-800 dark:text-amber-500">
                                      {aiData.score}%
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[9px] text-slate-500 space-y-0.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <p>💼 Exp: <span className="font-bold">{app.Candidate?.experience || 'N/A'} yrs</span></p>
                                  <p>📍 Location: <span className="font-bold">{app.Candidate?.currentLocation || 'N/A'}</span></p>
                                  {app.interviewDate && <p>📅 Date: <span className="font-bold">{new Date(app.interviewDate).toLocaleDateString()}</span></p>}
                                </div>

                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setActiveChatAppId(app.id)
                                      setActiveChatCandidateName(app.Candidate?.name || 'Candidate')
                                    }}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[9px] font-bold rounded-md border border-amber-200/50 flex-1 shrink-0"
                                    title="Open chat"
                                  >
                                    💬 Chat
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAppId(app.id)
                                      setEditingStatus(app.status === 'APPLICATION_RECEIVED' ? 'INTERVIEW_SCHEDULED' : 'INTERVIEW_COMPLETED')
                                      setEditingReason('')
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 text-[9px] font-bold rounded-md border border-slate-200 dark:border-slate-750 flex-1 shrink-0"
                                  >
                                    ⚙️ Action
                                  </button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              applications.length === 0 ? (
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
                        {/* AI Match Gauge */}
                        {(() => {
                          const aiData = calculateAiMatch(app.Candidate)
                          return (
                            <div className="mt-3 bg-amber-500/10 border border-amber-600/20 rounded-xl p-3 flex items-center gap-4 max-w-md">
                              <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="none"
                                    stroke="#b88f3f"
                                    strokeWidth="3"
                                    strokeDasharray={`${aiData.score} ${100 - aiData.score}`}
                                    className="transition-all duration-1000"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-500">
                                  {aiData.score}%
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-500 tracking-wider block">AI Suitability Match</span>
                                <ul className="text-[10px] text-slate-700 dark:text-slate-300 list-disc list-inside mt-0.5 space-y-0.5">
                                  {aiData.strengths.map((str, sIdx) => (
                                    <li key={sIdx} className="truncate">{str}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )
                        })()}
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
                      <p className="text-sm text-blue-800 flex items-center gap-2 flex-wrap">
                        Date: {new Date(app.interviewDate).toLocaleString()}
                        <InterviewCountdown date={app.interviewDate} />
                      </p>
                      {app.interviewDuration && (
                        <p className="text-xs font-semibold text-blue-700 mt-1">
                          ⏱️ Duration: {app.interviewDuration} Minutes ({app.interviewDuration >= 60 ? `${(app.interviewDuration / 60).toFixed(1)} hour(s)` : 'half-hour'})
                        </p>
                      )}
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
                      <CalendarButton interviewDate={app.interviewDate} googleMeetLink={app.googleMeetLink} />
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setEditingAppId(app.id)
                            setEditingStatus(app.status === 'APPLICATION_RECEIVED' ? 'INTERVIEW_SCHEDULED' : 'INTERVIEW_COMPLETED')
                            setEditingReason('')
                          }}
                          className="btn-warning px-3 py-1.5 text-xs font-semibold rounded-lg"
                        >
                          Edit Status
                        </button>
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
                        <div className="flex items-center gap-1">
                          <select
                            value={selectedClientMap[app.id] || ''}
                            onChange={(e) => setSelectedClientMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                            className="form-input text-xs max-w-[180px] bg-white inline-block h-9 py-1 px-2 border border-slate-300 rounded"
                          >
                            <option value="">-- Choose Client --</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                            ))}
                          </select>
                          <button
                            disabled={!selectedClientMap[app.id]}
                            onClick={() => handleUpdateStatus(app.id, 'SENT_TO_CLIENT', { clientId: selectedClientMap[app.id] })}
                            className="btn-success px-3 py-2 text-xs font-bold disabled:opacity-50 h-9 whitespace-nowrap"
                          >
                            🚀 Send to Client
                          </button>
                        </div>
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
                        <label className="form-label font-semibold text-slate-800">
                          Interview Duration
                        </label>
                        <select
                          value={scheduleData.interviewDuration}
                          onChange={(e) =>
                            setScheduleData({
                              ...scheduleData,
                              interviewDuration: parseInt(e.target.value),
                            })
                          }
                          className="form-input bg-white"
                        >
                          <option value={30}>30 Minutes (Half-hour)</option>
                          <option value={60}>60 Minutes (1 Hour)</option>
                          <option value={90}>90 Minutes (1.5 Hours)</option>
                          <option value={120}>120 Minutes (2 Hours)</option>
                        </select>
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

                  {/* Direct Chat with Candidate */}
                  <button
                    onClick={() => {
                      setActiveChatAppId(app.id)
                      setActiveChatCandidateName(app.Candidate?.name || 'Candidate')
                    }}
                    className="mt-4 w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-amber-200/40"
                  >
                    💬 Open Real-Time Chat Loop with Candidate & Client
                  </button>
                </div>
              )))
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

      {/* Global Slide-out Chat Thread Panel */}
      <ChatThreadPanel
        isOpen={!!activeChatAppId}
        onClose={() => setActiveChatAppId(null)}
        applicationId={activeChatAppId}
        candidateName={activeChatCandidateName}
        currentUser={user}
      />

      {/* Centered Edit Status Modal Overlay */}
      {editingAppId && (() => {
        const editingApp = applications.find(a => a.id === editingAppId);
        if (!editingApp) return null;
        return (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#2b2f3a] rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">⚙️ Update Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Candidate: {editingApp.Candidate?.name || 'Unassigned'}</p>
                </div>
                <button
                  onClick={() => setEditingAppId(null)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold p-1"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select New Status
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) => {
                      setEditingStatus(e.target.value)
                      if (e.target.value === 'INTERVIEW_SCHEDULED') {
                        setScheduleData({
                          interviewDate: editingApp.interviewDate ? editingApp.interviewDate.substring(0, 16) : '',
                          googleMeetLink: editingApp.googleMeetLink || generateCalMeetLink(),
                          interviewDuration: editingApp.interviewDuration || 60
                        })
                      }
                    }}
                    className="form-input w-full bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Choose Status --</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SENT_TO_CLIENT">Send to Client</option>
                  </select>
                </div>

                {editingStatus === 'INTERVIEW_SCHEDULED' && (
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/40 mt-2 text-left">
                    <h5 className="font-bold text-xs text-blue-800 uppercase tracking-wider dark:text-blue-400">Schedule Interview details</h5>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Date & Time</label>
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
                        className="form-input w-full bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Duration</label>
                      <select
                        value={scheduleData.interviewDuration}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            interviewDuration: parseInt(e.target.value),
                          })
                        }
                        className="form-input w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value={30}>30 Minutes (Half-hour)</option>
                        <option value={60}>60 Minutes (1 Hour)</option>
                        <option value={90}>90 Minutes (1.5 Hours)</option>
                        <option value={120}>120 Minutes (2 Hours)</option>
                      </select>
                    </div>
                  </div>
                )}

                {editingStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rejection Reason</label>
                    <textarea
                      placeholder="Specify rejection details..."
                      value={editingReason}
                      onChange={(e) => setEditingReason(e.target.value)}
                      className="form-input w-full h-24"
                    />
                  </div>
                )}

                {editingStatus === 'SENT_TO_CLIENT' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Client Company</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="form-input w-full"
                      required
                    >
                      <option value="">-- Choose Client (Company) --</option>
                      {clients.map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.name} ({cli.company})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingStatus === 'INTERVIEW_COMPLETED' && (
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/40 mt-2 text-left">
                    <h5 className="font-bold text-xs text-amber-800 uppercase tracking-wider dark:text-amber-500">Interview Feedback & Ratings</h5>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-650 dark:text-slate-400">Technical Skills Rating (1-10): {technicalRating}</label>
                      <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setTechnicalRating(num)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${technicalRating === num
                              ? 'bg-amber-655 text-white scale-110 shadow-sm shadow-amber-500/50'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-750 dark:text-slate-300 dark:hover:bg-slate-655'
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-655 dark:text-slate-400">Communication Skills Rating (1-10): {communicationRating}</label>
                      <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCommunicationRating(num)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${communicationRating === num
                              ? 'bg-amber-655 text-white scale-110 shadow-sm shadow-amber-500/50'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-750 dark:text-slate-300 dark:hover:bg-slate-655'
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-655 dark:text-slate-400">Cultural Fit Rating (1-10): {culturalRating}</label>
                      <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCulturalRating(num)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${culturalRating === num
                              ? 'bg-amber-655 text-white scale-110 shadow-sm shadow-amber-500/50'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-750 dark:text-slate-300 dark:hover:bg-slate-655'
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 mb-1">Recommendation</label>
                      <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="form-input text-xs w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        <option value="Strong Hire">Strong Hire</option>
                        <option value="Hire">Hire</option>
                        <option value="No Hire">No Hire</option>
                        <option value="Strong No Hire">Strong No Hire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 mb-1">Detailed Remarks</label>
                      <textarea value={feedbackComments} onChange={(e) => setFeedbackComments(e.target.value)} placeholder="Enter details..." className="form-input text-xs h-20 w-full" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => {
                      setEditingAppId(null)
                      setEditingStatus('')
                      setEditingReason('')
                      setTechnicalRating(5)
                      setCommunicationRating(5)
                      setCulturalRating(5)
                      setRecommendation('Hire')
                      setFeedbackComments('')
                      setSelectedClientId('')
                    }}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        editingApp.id,
                        editingStatus,
                        editingStatus === 'INTERVIEW_SCHEDULED' ? {
                          interviewDate: scheduleData.interviewDate,
                          googleMeetLink: scheduleData.googleMeetLink || generateCalMeetLink(),
                          interviewDuration: scheduleData.interviewDuration
                        } : (
                          editingStatus === 'INTERVIEW_COMPLETED' ? {
                            technicalRating,
                            communicationRating,
                            culturalRating,
                            recommendation,
                            feedbackComments
                          } : (editingStatus === 'SENT_TO_CLIENT' ? { clientId: selectedClientId } : { rejectionReason: editingReason })
                        )
                      )
                    }
                    className="btn-primary px-4 py-2 text-sm text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
        </>
      )}

      {/* Custom Frosted Liquid Glass Confirm Dialog */}
      {confirmModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2b2f3a] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center text-slate-800 dark:text-white">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4 font-bold">
              ❓
            </div>
            <h3 className="text-base font-bold mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm()
                  setConfirmModal({ isOpen: false, message: '', onConfirm: null })
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 15px rgba(217,119,6,0.4)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default RecruiterDashboard
