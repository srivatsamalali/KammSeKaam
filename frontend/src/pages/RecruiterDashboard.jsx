import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  recruiterService,
  applicationService,
  notificationService,
  messageService,
} from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import { triggerMessageNotification } from '../utils/notification'

const calculateAiMatch = (candidate) => {
  if (!candidate) return { score: 0, strengths: [] }
  let score = 65
  const strengths = []
  
  const skills = Array.isArray(candidate.technicalSkills)
    ? candidate.technicalSkills
    : typeof candidate.technicalSkills === 'string'
    ? JSON.parse(candidate.technicalSkills || '[]')
    : []

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
      setMessages(res.data);
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
                    className={`flex flex-col max-w-[80%] ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        isMe
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
  const [technicalRating, setTechnicalRating] = useState(5)
  const [communicationRating, setCommunicationRating] = useState(5)
  const [culturalRating, setCulturalRating] = useState(5)
  const [recommendation, setRecommendation] = useState('Hire')
  const [feedbackComments, setFeedbackComments] = useState('')

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
      setScheduleData({ interviewDate: '', googleMeetLink: '' })
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(app.interviewDate).toLocaleString()}
                      </p>
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
                      <CalendarButton interviewDate={app.interviewDate} googleMeetLink={app.googleMeetLink} />
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
                              <option value="SENT_TO_CLIENT">Send to Client</option>
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

                            {editingStatus === 'INTERVIEW_COMPLETED' && (
                              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50 mt-2 text-left dark:bg-slate-800/40 dark:border-slate-700/50">
                                <h5 className="font-bold text-xs text-amber-800 uppercase tracking-wider dark:text-amber-500">Interview Feedback</h5>
                                
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">Technical Skills Rating (1-10): {technicalRating}</label>
                                  <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                      <button
                                        key={num}
                                        type="button"
                                        onClick={() => setTechnicalRating(num)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                                          technicalRating >= num
                                            ? 'bg-amber-600 text-white scale-110 shadow-sm shadow-amber-500/50'
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">Communication Skills Rating (1-10): {communicationRating}</label>
                                  <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                      <button
                                        key={num}
                                        type="button"
                                        onClick={() => setCommunicationRating(num)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                                          communicationRating >= num
                                            ? 'bg-amber-600 text-white scale-110 shadow-sm shadow-amber-500/50'
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">Cultural Fit Rating (1-10): {culturalRating}</label>
                                  <div className="flex items-center space-x-1 mt-1 overflow-x-auto py-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                      <button
                                        key={num}
                                        type="button"
                                        onClick={() => setCulturalRating(num)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                                          culturalRating >= num
                                            ? 'bg-amber-600 text-white scale-110 shadow-sm shadow-amber-500/50'
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500">Recommendation</label>
                                  <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="form-input text-xs">
                                    <option value="Strong Hire">Strong Hire</option>
                                    <option value="Hire">Hire</option>
                                    <option value="No Hire">No Hire</option>
                                    <option value="Strong No Hire">Strong No Hire</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500">Detailed Feedback Comments</label>
                                  <textarea value={feedbackComments} onChange={(e) => setFeedbackComments(e.target.value)} placeholder="Provide detailed remarks..." className="form-input text-xs h-20" />
                                </div>
                              </div>
                            )}

                            <div className="space-x-2">
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    app.id,
                                    editingStatus,
                                    editingStatus === 'INTERVIEW_COMPLETED' ? {
                                      technicalRating,
                                      communicationRating,
                                      culturalRating,
                                      recommendation,
                                      feedbackComments
                                    } : { rejectionReason: editingReason }
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
                                  setTechnicalRating(5)
                                  setCommunicationRating(5)
                                  setCulturalRating(5)
                                  setRecommendation('Hire')
                                  setFeedbackComments('')
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

                  {/* Direct Chat with Candidate */}
                  <ChatPanel applicationId={app.id} />
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
