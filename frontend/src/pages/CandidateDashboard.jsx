import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { candidateService, messageService } from '../services/api'
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
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${
      isLive 
        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
        : 'bg-amber-50 text-amber-800 border border-amber-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-amber-600 animate-pulse'}`} />
      <span>{isLive ? '' : 'In: '}{timeLeft}</span>
    </div>
  )
}

const ApplicationStepper = ({ status }) => {
  const steps = [
    { label: 'Received', key: 'APPLICATION_RECEIVED' },
    { label: 'Interview Scheduled', key: 'INTERVIEW_SCHEDULED' },
    { label: 'Interview Completed', key: 'INTERVIEW_COMPLETED' },
    { label: 'Client Review', key: 'SENT_TO_CLIENT' },
    { label: 'Outcome', key: 'SELECTED' },
  ];

  const getActiveIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'APPLICATION_RECEIVED': return 0;
      case 'INTERVIEW_SCHEDULED': return 1;
      case 'INTERVIEW_COMPLETED': return 2;
      case 'SENT_TO_CLIENT': return 3;
      case 'SELECTED':
      case 'REJECTED': return 4;
      default: return 0;
    }
  };

  const activeIndex = getActiveIndex(status);

  return (
    <div className="w-full py-4 mt-2 overflow-x-auto">
      <div className="flex items-center min-w-[500px] px-4">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex || (index === 4 && status === 'SELECTED');
          const isActive = index === activeIndex;
          const isRejected = status === 'REJECTED' && index === 4;

          return (
            <React.Fragment key={step.key}>
              {index > 0 && (
                <div
                  className={`flex-1 h-1 transition-all duration-500 ${
                    index <= activeIndex ? 'bg-amber-500' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all duration-500 ${
                    isRejected
                      ? 'bg-red-500 border-red-500 text-white'
                      : isCompleted
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : isActive
                      ? 'bg-white border-amber-500 text-amber-700 ring-4 ring-amber-100'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {isRejected ? '✕' : isCompleted ? '✓' : index + 1}
                </div>
                <div className="absolute top-10 text-[10px] font-semibold text-gray-500 whitespace-nowrap text-center">
                  {isRejected ? 'Rejected' : step.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="h-6" />
    </div>
  );
};

const CalendarButton = ({ interviewDate, googleMeetLink }) => {
  const [showOptions, setShowOptions] = useState(false);

  if (!interviewDate) return null;

  const dateObj = new Date(interviewDate);
  const startDate = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
  const endDate = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview+with+Aston+Recruitment&dates=${startDate}/${endDate}&details=Google+Meet+Link:+${encodeURIComponent(googleMeetLink || 'Will be provided')}&location=Online`;

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
            triggerMessageNotification('Recruiter', msg.message);
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
        <span>💬 Chat with Recruiter</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="p-4 flex flex-col h-64 bg-white">
          <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-1">
            {messages.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-8 font-semibold">No messages yet. Start coordinates!</p>
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

const majorCities = ['Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Kolkata']

const qualifications = [
  'B.Tech / B.E.',
  'M.Tech / M.E.',
  'BCA',
  'MCA',
  'B.Sc',
  'M.Sc',
  'B.Com',
  'MBA',
  'Diploma',
  'High School',
  'Post Graduate',
  'Doctorate (Ph.D)'
]

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
  'Swiggy',
  'PhonePe',
  'Razorpay',
  'Cred',
  'Meesho',
  'Nykaa',
  'TCS iON'
]

const CandidateDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  const [availableSkills, setAvailableSkills] = useState(['Java', 'Python', 'Javascript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker'])
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [activeChatAppId, setActiveChatAppId] = useState(null)
  const [activeChatCandidateName, setActiveChatCandidateName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null })

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to logout?',
      onConfirm: () => {
        logout()
        navigate('/candidate/login')
      }
    })
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

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname)

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname)
      setConfirmModal({
        isOpen: true,
        message: 'You are about to logout. Are you sure you want to leave?',
        onConfirm: () => {
          logout()
          navigate('/candidate/login')
        }
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [logout, navigate])

  const fetchProfile = async () => {
    try {
      const response = await candidateService.getProfile()
      const data = response.data || {}
      const sanitizedSkills = parseSkills(data.technicalSkills)
      const sanitizedData = {
        ...data,
        technicalSkills: sanitizedSkills
      }
      setProfile(sanitizedData)
      setFormData(sanitizedData)
      
      // Append loaded candidate skills to available skills checkbox list if not present
      if (sanitizedSkills.length > 0) {
        setAvailableSkills(prev => {
          const next = [...prev]
          sanitizedSkills.forEach(s => {
            if (!next.includes(s)) {
              next.push(s)
            }
          })
          return next
        })
      }
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
      const appIds = res.data.map(app => app.id)
      localStorage.setItem('candidate_app_ids', JSON.stringify(appIds))
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
      if (resumeFile) {
        form.append('resume', resumeFile)
      }

      await candidateService.updateProfile(form)
      setEditMode(false)
      setResumeFile(null)
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
        {applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').map((app) => (
          <div key={app.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between dark:bg-amber-950/20 dark:border-amber-900/30">
            <div className="mb-4 md:mb-0">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wider mb-2">
                Upcoming Interview
              </span>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-2">
                Scheduled for {new Date(app.interviewDate).toLocaleString()}
                <InterviewCountdown date={app.interviewDate} />
              </h4>
              {app.interviewDuration && (
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  ⏱️ Duration: {app.interviewDuration} Minutes ({app.interviewDuration >= 60 ? `${(app.interviewDuration / 60).toFixed(1)} hour(s)` : 'half-hour'})
                </p>
              )}
              {app.googleMeetLink && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Meet Link:{' '}
                  <a
                    href={app.googleMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-blue-600 dark:text-blue-400"
                  >
                    {app.googleMeetLink}
                  </a>
                </p>
              )}
            </div>
            {app.googleMeetLink && (
              <a
                href={app.googleMeetLink}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg text-center transition-all shadow-md shadow-amber-500/20"
              >
                Join Interview Room
              </a>
            )}
          </div>
        ))}

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

        {/* Profile Completion Tracker */}
        {profile && (() => {
          let score = 0;
          if (profile.name) score += 20;
          if (profile.experience) score += 20;
          if (profile.currentLocation) score += 20;
          if (profile.currentCompany) score += 20;
          const skills = parseSkills(profile.technicalSkills)
          if (skills.length > 0) score += 20;

          const missing = [];
          if (!profile.experience) missing.push("Add years of experience (+20%)");
          if (!profile.currentLocation) missing.push("Add current location (+20%)");
          if (!profile.currentCompany) missing.push("Add current company (+20%)");
          if (skills.length === 0) missing.push("Add technical skills (+20%)");

          return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Setup Progress</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{score}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-amber-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${score}%` }} 
                />
              </div>
              {missing.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">Recommended to reach 100%:</span>
                  <ul className="text-[10px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {missing.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  ✓ Profile is fully complete and optimized for recruiter views!
                </span>
              )}
            </div>
          );
        })()}

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
                  <select
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
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
                    value={formData.currentCompany || ''}
                    onChange={(e) => {
                      handleChange(e)
                      setShowCompanySuggestions(true)
                    }}
                    onFocus={() => setShowCompanySuggestions(true)}
                    onBlur={() => {
                      // Delay hiding suggestions list to let click registry trigger
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

                <div className="form-group">
                  <label className="form-label">Current CTC (Lakhs/Annum)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="currentCTC"
                    value={formData.currentCTC}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 6.50"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected CTC (Lakhs/Annum)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="expectedCTC"
                    value={formData.expectedCTC}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 8.50"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Location</label>
                  <select
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select Preferred Location</option>
                    {majorCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Period (days)</label>
                  <input
                    type="number"
                    min="0"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {/* Premium Drag and Drop Resume Dropzone (Only visible for selected/referred candidates) */}
              {applications.some(app => app.status === 'SENT_TO_CLIENT' || app.status === 'SELECTED') && (
                <div className="form-group border-t border-slate-105 dark:border-slate-800 pt-4 mt-6">
                  <label className="form-label font-bold text-slate-850 dark:text-slate-200">
                    Upload Resume PDF
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    Drop your latest resume to analyze technical matching and recalculate AI suitability indices.
                  </p>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                      const file = e.dataTransfer.files[0]
                      if (file && file.type === 'application/pdf') {
                        setResumeFile(file)
                      } else {
                        alert('Only PDF files are allowed!')
                      }
                    }}
                    onClick={() => document.getElementById('resume-file-input').click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-350 ${
                      dragOver 
                        ? 'border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/15' 
                        : 'border-slate-300 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/10 hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <input 
                      id="resume-file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) setResumeFile(file)
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl animate-bounce">📁</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {resumeFile ? `Selected: ${resumeFile.name}` : 'Drag and drop your Resume PDF here, or click to browse'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF formats under 5MB only</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skill preference checkboxes and custom addition panel */}
              <div className="form-group border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <label className="form-label font-bold text-slate-800 dark:text-slate-200">
                  Technical Skills & Tech Stacks Checklist
                </label>
                <p className="text-[10px] text-slate-500 mb-3">
                  Choose matching capabilities. Select all checkpoints that apply to unlock 100% profile coverage and stand out to recruiters.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 max-h-36 overflow-y-auto">
                  {availableSkills.map((skill) => {
                    const isChecked = formData.technicalSkills.includes(skill)
                    return (
                      <label 
                        key={skill} 
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
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

                <div className="flex gap-2 items-center max-w-sm">
                  <input 
                    type="text"
                    placeholder="Add other skill (e.g. Kotlin)"
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

              <button type="submit" className="btn-primary w-full">
                Save Profile
              </button>
            </form>
          ) : (
            <>
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
              {profile?.resumePath && (
                <div className="md:col-span-2 mt-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-205/60 dark:border-slate-800/60 flex justify-between items-center flex-wrap gap-2 text-left">
                  <div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">Active Resume PDF Document</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Indexed and processed for candidate profile requirements</p>
                  </div>
                  <a 
                    href={`http://localhost:5001${profile.resumePath}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    📥 Download Resume PDF
                  </a>
                </div>
              )}
            </div>

            {/* AI Resume Analysis Panel */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-amber-50/50 dark:bg-slate-900/40 border border-amber-200/50 dark:border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500 mb-3 flex items-center gap-1.5">
                  ✨ AI Resume Match Analysis
                </h4>
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  {/* Suitability Radial Indicator */}
                  {(() => {
                    let matchScore = 0;
                    if (profile?.name) matchScore += 20;
                    if (profile?.experience) matchScore += 20;
                    if (profile?.currentLocation) matchScore += 10;
                    if (profile?.preferredLocation) matchScore += 10;
                    if (profile?.currentCompany) matchScore += 10;
                    if (profile?.highestQualification) matchScore += 10;
                    const skills = parseSkills(profile?.technicalSkills);
                    matchScore += Math.min(skills.length * 10, 20);
                    const finalScore = Math.min(matchScore, 100);

                    return (
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke="#b88f3f"
                            strokeWidth="3"
                            strokeDasharray={`${finalScore} ${100 - finalScore}`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-amber-800 dark:text-amber-500">
                          {finalScore}%
                        </div>
                      </div>
                    )
                  })()}
                  {/* Match Details */}
                  <div className="flex-1 w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Extracted Core Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {parseSkills(profile?.technicalSkills).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-[10px] rounded font-semibold border border-amber-200/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-300">AI Insight:</strong> Strong alignment with Aston Recruitment client mandates. Technical skills match 4 active openings in your area. Recommended: Add system design keywords to improve ATS readability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
        {/* Applications section */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Your Applications</h3>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications yet</p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="card mb-6 p-6">
                <div className="flex flex-col md:flex-row justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      Application Reference: #{app.id.substring(0, 8)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned Recruiter: {app.Recruiter?.name || 'Not assigned'}
                    </p>
                    {app.interviewDate && (
                      <div className="mt-3 text-xs text-gray-600 bg-amber-50/75 border border-amber-200/50 rounded-xl p-3 flex flex-col gap-1 items-start max-w-sm">
                        <span className="font-bold text-amber-900">📅 Interview Scheduled:</span>
                        <span className="font-semibold">{new Date(app.interviewDate).toLocaleString()}</span>
                        {app.googleMeetLink && (
                          <span className="flex items-center gap-1 mt-1">
                            🔗 Link:{' '}
                            <a
                              href={app.googleMeetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-800 underline font-bold"
                            >
                              Join Google Meet
                            </a>
                          </span>
                        )}
                        <CalendarButton interviewDate={app.interviewDate} googleMeetLink={app.googleMeetLink} />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <p className="text-sm text-gray-500 font-semibold">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border bg-slate-50 border-slate-200 text-slate-700">
                      Status: {app.status}
                    </span>
                  </div>
                </div>
                
                {/* Stepper Timeline */}
                <ApplicationStepper status={app.status} />

                {/* Recruiter Chat Button trigger */}
                {app.recruiterId && (
                  <button
                    onClick={() => {
                      setActiveChatAppId(app.id)
                      setActiveChatCandidateName(profile?.name || 'Candidate')
                    }}
                    className="mt-4 w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-amber-200/40"
                  >
                    💬 Open Real-Time Chat Loop with Recruiter & Client
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Slide-out Chat Thread Panel */}
      <ChatThreadPanel
        isOpen={!!activeChatAppId}
        onClose={() => setActiveChatAppId(null)}
        applicationId={activeChatAppId}
        candidateName={activeChatCandidateName}
        currentUser={user}
      />

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

export default CandidateDashboard
