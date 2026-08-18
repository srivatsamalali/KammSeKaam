import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { candidateService, recruiterService } from '../services/api'

const PRESET_QUERIES = [
  {
    id: 'how_schedule',
    question: 'How do I schedule an interview?',
    answer: 'Recruiters can schedule interviews by logging in via /recruiter/login, clicking the "Schedule" button on any candidate application tab, setting the date, and sharing the auto-generated meeting room link.',
    path: '/recruiter/login'
  },
  {
    id: 'upload_resume',
    question: 'How can a candidate upload their resume?',
    answer: 'Candidates can manage their profile and upload their resume (PDF format, under 5MB) by logging in via /candidate/login and clicking the "Edit Profile" button to update their information.',
    path: '/candidate/login'
  },
  {
    id: 'find_meeting',
    question: 'Where do I find my meeting room?',
    answer: 'Once scheduled, meeting rooms are accessible via the candidate/recruiter dashboards under the "Upcoming Interviews" banner, or directly via the URL structure `/meeting/<roomId>`.',
    path: '/'
  },
  {
    id: 'admin_actions',
    question: 'What is the Admin\'s role?',
    answer: 'Admins log in via /admin/login. They can create/edit/delete recruiter profiles, override candidate statuses, view system analytics, and assign candidates to matching recruiters.',
    path: '/admin/login'
  }
]

const ChatBot = () => {
  const { user } = useAuth()
  const location = useLocation()

  if (location.pathname === '/' || window.location.pathname === '/') {
    return null
  }
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am the Aston Recruitment Assistant. How can I help you navigate the Aston Recruitment portal today?'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleQueryClick = (query) => {
    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query.question }])
    setIsTyping(true)

    // Simulate response delay
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: query.answer,
          link: query.path
        }
      ])
    }, 800)
  }

  const handleCheckStatus = async () => {
    setMessages((prev) => [...prev, { sender: 'user', text: '🔍 Check my Application Status' }])
    setIsTyping(true)
    
    try {
      const res = await candidateService.getApplications()
      const apps = res.data
      setIsTyping(false)
      if (apps.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'You do not have any active applications submitted at the moment. You can submit your resume on your candidate dashboard.'
          }
        ])
      } else {
        const app = apps[0]
        const dateStr = app.interviewDate ? ` scheduled for ${new Date(app.interviewDate).toLocaleString()}` : ''
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `Your active application status is: **${app.status.replace(/_/g, ' ')}**${dateStr}. Keep checking your candidate dashboard for live updates.`
          }
        ])
      }
    } catch (err) {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to fetch your application details. Make sure you are logged in as a candidate.'
        }
      ])
    }
  }

  const handleCheckRecruiterInterviews = async () => {
    setMessages((prev) => [...prev, { sender: 'user', text: '🗓️ Check My Scheduled Interviews' }])
    setIsTyping(true)
    
    try {
      const res = await recruiterService.getApplications()
      const apps = res.data || []
      const activeInterviews = apps.filter(app => app.status === 'INTERVIEW_SCHEDULED')
      setIsTyping(false)
      if (activeInterviews.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'You have no upcoming scheduled interviews at the moment.'
          }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `You have **${activeInterviews.length}** upcoming interviews scheduled. Check your recruiter dashboard to launch meeting rooms or schedule status updates.`
          }
        ])
      }
    } catch (err) {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to retrieve your interviews. Please verify your recruiter dashboard session.'
        }
      ])
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 chatbot-container">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all border border-amber-500/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-amber-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              <span className="font-bold text-sm">Aston Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.link && (
                    <Link
                      to={msg.link}
                      onClick={() => setIsOpen(false)}
                      className="mt-1.5 inline-block text-amber-700 dark:text-amber-400 font-bold underline"
                    >
                      Go to Route →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl rounded-tl-none w-14">
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Queries List */}
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3 max-h-36 overflow-y-auto flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select a query:
            </span>
            {user?.role === 'CANDIDATE' && (
              <button
                onClick={handleCheckStatus}
                className="text-[10px] font-bold text-left bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center justify-between"
              >
                <span>🔍 Check my Application Status</span>
                <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">Live Status</span>
              </button>
            )}
            {user?.role === 'RECRUITER' && (
              <button
                onClick={handleCheckRecruiterInterviews}
                className="text-[10px] font-bold text-left bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center justify-between"
              >
                <span>🗓️ Check My Scheduled Interviews</span>
                <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">Live Count</span>
              </button>
            )}
            {PRESET_QUERIES.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQueryClick(q)}
                className="text-[10px] font-medium text-left bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                💡 {q.question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatBot
