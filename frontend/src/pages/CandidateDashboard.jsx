import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { candidateService, messageService } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

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
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Scheduled for {new Date(app.interviewDate).toLocaleString()}
              </h4>
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

                {/* Recruiter Chat */}
                {app.recruiterId && (
                  <ChatPanel applicationId={app.id} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateDashboard
