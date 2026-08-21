import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { candidateService, recruiterService } from '../services/api'
import { createPortal } from 'react-dom'

const PRESET_QUERIES = [
  {
    id: 'how_register',
    question: 'How do I register?',
    answer: 'To register, click "Candidate Registration" or "Looking for a job?" to set up your profile, input experience and CTC preferences, and upload your resume (PDF, under 5MB).',
    path: '/candidate/register'
  },
  {
    id: 'cities_operate',
    question: 'What cities do you operate in?',
    answer: 'We operate in all major tech centers including Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, and Delhi NCR.',
    path: '/'
  },
  {
    id: 'want_hire',
    question: 'I want to hire candidates',
    answer: 'If you are looking to hire, select "For Clients" or click "Tell us who you\'re hiring" at the bottom of the home page to hire matching professionals.',
    path: '/'
  },
  {
    id: 'how_schedule',
    question: 'How do I schedule an interview?',
    answer: 'Recruiters can schedule interviews by logging in, opening the Candidate details panel on their dashboard, clicking "Schedule Interview", and entering the details.',
    path: '/recruiter/login'
  },
  {
    id: 'upload_resume',
    question: 'How can a candidate upload their resume?',
    answer: 'Candidates can manage their profile and upload their resume by logging in via /candidate/login, and clicking "Edit Profile" on their dashboard.',
    path: '/candidate/login'
  },
  {
    id: 'find_meeting',
    question: 'Where do I find my meeting room?',
    answer: 'Once scheduled, meeting rooms are accessible via the candidate/recruiter dashboards under the active applications or interview cards, or directly via `/meeting/<roomId>`.',
    path: '/'
  },
  {
    id: 'admin_actions',
    question: 'What is the Admin\'s role?',
    answer: 'Admins log in via /admin/login. They can manage recruiters and candidates, assign candidates, override application statuses, and view system analytics.',
    path: '/admin/login'
  }
]

const ChatBot = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! Welcome to Aston Recruitment. How can I help you navigate the Aston Recruitment portal today?'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleQueryClick = (query) => {
    setMessages((prev) => [...prev, { sender: 'user', text: query.question }])
    setIsTyping(true)

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
    }, 600)
  }

  const handleSendFreeText = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }])
    setIsTyping(true)

    setTimeout(() => {
      let reply = "Thank you for reaching out! Aston Recruitment assists matching top talents with premier organizations. Contact us at contact@astonrecruitment.in for customized contracts."
      
      const query = trimmed.toLowerCase()
      const matchedPreset = PRESET_QUERIES.find(q => 
        query.includes(q.question.toLowerCase()) || 
        q.question.toLowerCase().includes(query)
      )
      
      if (matchedPreset) {
        reply = matchedPreset.answer
      } else if (query.includes('register') || query.includes('apply')) {
        reply = "To register, click 'Candidate Registration' at the top right to upload your resume and checklist your techstacks."
      } else if (query.includes('cities') || query.includes('location')) {
        reply = "We operate in all major tech centers including Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, and Delhi NCR."
      } else if (query.includes('hire') || query.includes('client')) {
        reply = "If you are looking to hire, select 'For Clients' or click 'Tell us who you\'re hiring' at the bottom of the home page."
      } else if (query.includes('schedule') || query.includes('interview')) {
        reply = "Recruiters can schedule interviews by logging in, opening the Candidate details panel on their dashboard, clicking 'Schedule Interview', and entering the details."
      } else if (query.includes('resume') || query.includes('upload')) {
        reply = "Candidates can manage their profile and upload their resume by logging in via /candidate/login, and clicking 'Edit Profile' on their dashboard."
      } else if (query.includes('meeting') || query.includes('room') || query.includes('link')) {
        reply = "Once scheduled, meeting rooms are accessible via the candidate/recruiter dashboards under the active applications or interview cards, or directly via `/meeting/<roomId>`."
      } else if (query.includes('admin')) {
        reply = "Admins log in via /admin/login. They can manage recruiters and candidates, assign candidates, override application statuses, and view system analytics."
      }

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          link: matchedPreset?.path
        }
      ])
    }, 600)
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

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9990]">
      {/* Floating Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-custom chatbot-toggle-button hover:scale-105 active:scale-95 transition-all flex items-center justify-between pl-5 pr-4 py-3.5 relative cursor-pointer gap-3 group"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fef3c7]">Ask Aston</span>
            <span className="text-[9px] text-[#fef3c7] font-semibold flex items-center gap-1 mt-0.5">
              We\'re online
            </span>
          </div>
          <span className="text-2xl bg-white/20 p-2.5 rounded-full group-hover:rotate-12 transition-transform">💬</span>
        </button>
      ) : (
        /* Unified Premium Dark Chatbot Panel */
        <div className="w-[calc(100vw-32px)] sm:w-96 rounded-3xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[420px] animate-slide-up text-left">
          {/* Header */}
          <div className="bg-[#090f19] px-4 py-3.5 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-xs font-bold text-white leading-none">Aston AI Assistant</h4>
                <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-850 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end ml-8' : 'items-start mr-8'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#b88f3f] text-white rounded-br-none font-semibold'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.link && (
                    <Link
                      to={msg.link}
                      onClick={() => setIsOpen(false)}
                      className="mt-1.5 inline-block text-amber-400 font-bold underline"
                    >
                      Go to Route →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none w-14">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Buttons Grid */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-900 bg-slate-950/50 max-h-28 overflow-y-auto">
            {user?.role === 'CANDIDATE' && (
              <button
                type="button"
                onClick={handleCheckStatus}
                className="text-[9px] font-bold text-[#fef3c7] bg-[#b88f3f]/20 hover:bg-[#b88f3f]/30 border border-[#b88f3f]/40 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1"
              >
                🔍 Check Status
              </button>
            )}
            {user?.role === 'RECRUITER' && (
              <button
                type="button"
                onClick={handleCheckRecruiterInterviews}
                className="text-[9px] font-bold text-[#fef3c7] bg-[#b88f3f]/20 hover:bg-[#b88f3f]/30 border border-[#b88f3f]/40 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1"
              >
                🗓️ Check Interviews
              </button>
            )}
            {PRESET_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleQueryClick(q)}
                className="text-[9px] font-bold text-slate-300 bg-slate-900/80 hover:bg-[#b88f3f]/10 hover:text-[#b88f3f] border border-slate-800 hover:border-amber-500/30 px-2.5 py-1 rounded-full transition-all text-left"
              >
                💡 {q.question}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const text = e.target.elements.botInput.value
              if (!text.trim()) return
              handleSendFreeText(text)
              e.target.reset()
            }}
            className="p-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              name="botInput"
              placeholder="Ask something..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>,
    document.body
  )
}

export default ChatBot
