import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

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
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am the Aston Recruitment Assistant. How can I help you navigate the KaamSeKaam portal today?'
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
                  <p className="leading-relaxed">{msg.text}</p>
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
