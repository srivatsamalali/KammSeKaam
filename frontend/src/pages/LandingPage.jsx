import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [showPreferenceModal, setShowPreferenceModal] = useState(false)
  const [preferenceView, setPreferenceView] = useState('main')
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! Welcome to Aston Recruitment. How can I help you today?", isBot: true }
  ])

  const handleSendBotMessage = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setChatMessages(prev => [...prev, { text: trimmed, isBot: false }])

    // Generate responsive bot reply
    setTimeout(() => {
      let reply = "Thank you for reaching out! Aston Recruitment assists matching top tech talents with premier organizations. Contact us at contact@astonrecruitment.in for custom contracts."
      
      const query = trimmed.toLowerCase()
      if (query.includes('register') || query.includes('apply')) {
        reply = "To register, click 'Candidate Login' at the top right, then select 'Register' to upload your resume and checklist your techstacks."
      } else if (query.includes('cities') || query.includes('location')) {
        reply = "We operate in all major tech centers in India including Bengaluru, Mumbai, Pune, Hyderabad, Chennai, Kolkata, and Delhi NCR."
      } else if (query.includes('hire') || query.includes('recruitor') || query.includes('client')) {
        reply = "If you are looking to hire, select 'Are you hiring' from our welcome popup or log in as a Recruiter or Client partner from the top menu."
      }

      setChatMessages(prev => [...prev, { text: reply, isBot: true }])
    }, 600)
  }

  useEffect(() => {
    // Clear credentials, preferences and session cache initially on landing
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_preference')
    localStorage.removeItem('user_preference_timestamp')
    window.dispatchEvent(new Event('local-storage-pref'))

    // Delay showing the preference modal by 500ms
    const timer = setTimeout(() => {
      setShowPreferenceModal(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const faqData = [
    {
      q: "How does the Jitsi video call work?",
      a: "Aston video rooms are built directly on top of Jitsi. Once a recruiter schedules an interview, a secure link is generated automatically, and both candidate and recruiter can connect right from their dashboards. No app downloads are required."
    },
    {
      q: "Is there a real-time coding playground?",
      a: "Yes! Candidates can use the built-in collaborative code editor during the interview to write and execute solutions in JavaScript, Python, C++, and Java. Recruiters can view live snippets, execute test runs, and save evaluation notes."
    },
    {
      q: "How do recruiters get notified of candidate applications?",
      a: "Our portal features persistent background message polling and desktop popups. Whenever a candidate submits a message or application code snippet, the recruiter receives immediate visual toast notifications and synthetic audio chimes."
    }
  ]

  return (
    <div className="min-h-screen page-shell">

      {/* Hero Section */}
      <section
        id="home"
        className="scroll-mt-28 min-h-[calc(100vh-7rem)] py-20"
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 overflow-hidden fade-in">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-2 text-sm text-sky-700 font-semibold">
                  <span className="block h-2.5 w-2.5 rounded-full bg-sky-600 animate-pulse" />
                  Smart consultancy matching
                </div>
                <div>
                  <h2 className="section-heading mb-4">
                    Connecting Talent with Opportunity
                  </h2>
                  <p className="section-subtitle mb-8">
                    Aston Recruitment is your premier consultancy management
                    portal connecting talented candidates with leading
                    recruiters.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link to="/candidate/register" className="btn-primary">
                    Candidate Registration
                  </Link>
                  <Link to="/candidate/login" className="btn-secondary">
                    Candidate Login
                  </Link>
                </div>
              </div>

              <div className="hero-image">
                <div className="hero-graphic" />
                <div className="hero-overlay" />
                <div className="hero-hero-text text-center px-8 py-10">
                  <div className="glass p-8 border border-white/60 shadow-2xl">
                    <p className="text-sky-700 uppercase tracking-[0.24em] text-sm font-semibold mb-4">
                      AI Consultancy Intelligence
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                      Smarter matches, faster growth
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      A polished visual space with smooth glassy curves and
                      vibrant gradients that highlights your consultancy brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-28 py-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">
              About Aston Recruitment
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8">
              <h4 className="text-xl font-bold text-sky-700 mb-4">
                For Candidates
              </h4>
              <p className="text-slate-600">
                Find your dream job, manage applications, and schedule
                interviews with top recruiters in a seamless experience.
              </p>
            </div>
            <div className="glass-card p-8">
              <h4 className="text-xl font-bold text-sky-700 mb-4">
                For Recruiters
              </h4>
              <p className="text-slate-600">
                Manage candidate pools, schedule interviews, and collaborate
                with your team to find the perfect fit.
              </p>
            </div>
            <div className="glass-card p-8">
              <h4 className="text-xl font-bold text-sky-700 mb-4">
                For Admins
              </h4>
              <p className="text-slate-600">
                Control and manage the entire recruitment process with
                comprehensive analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="scroll-mt-28 py-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">Our Services</h3>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Smart, polished features for candidates, recruiters, and admins
              with premium experience across every step.
            </p>
          </div>
          <div className="service-grid">
            <div className="service-card fade-in">
              <div className="service-icon">📄</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Resume Management
              </h4>
              <p className="text-slate-600">
                Upload, store, and organize resumes with AI-ready matching for
                the right job fit.
              </p>
            </div>
            <div
              className="service-card fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="service-icon">📅</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Interview Scheduling
              </h4>
              <p className="text-slate-600">
                Auto-sync interviews and availability so every meeting is booked
                on time.
              </p>
            </div>
            <div
              className="service-card fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <div className="service-icon">💬</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Communication Hub
              </h4>
              <p className="text-slate-600">
                Keep candidate and recruiter messages organized with status
                updates and notifications.
              </p>
            </div>
            <div
              className="service-card fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <div className="service-icon">📈</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Application Tracking
              </h4>
              <p className="text-slate-600">
                Track every application stage with clear progress cards and
                recruiter insights.
              </p>
            </div>
            <div
              className="service-card fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="service-icon">🔔</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Instant Alerts
              </h4>
              <p className="text-slate-600">
                Receive immediate feedback and job match notifications so
                nothing slips through.
              </p>
            </div>
            <div
              className="service-card fade-in"
              style={{ animationDelay: '500ms' }}
            >
              <div className="service-icon">🎯</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Skill Matching
              </h4>
              <p className="text-slate-600">
                Match candidate strengths to recruiter requirements using
                intelligent skill scoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-28 py-20 bg-slate-50/50 dark:bg-slate-900/30 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-500 mt-2 text-sm font-semibold">
              Got questions? We've got answers to help you navigate Aston Recruitment.
            </p>
          </div>
          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <span className="text-sm">{item.q}</span>
                  <span className="text-slate-400 font-bold transition-transform duration-300 transform" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'max-h-40 border-t border-slate-100 dark:border-slate-700' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="p-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8 glass-card p-8">
            <div>
              <h5 className="font-bold mb-4">About</h5>
              <p className="text-gray-400 text-sm">
                Leading consultancy management platform
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact</h5>
              <p className="text-gray-400 text-sm">
                Contact@astonrecruitment.in
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <p className="text-gray-400 text-sm">
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </p>
              <p className="text-gray-400 text-sm">
                <a href="#" className="hover:text-white">
                  Terms
                </a>
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Follow</h5>
              <p className="text-gray-400 text-sm">Social Media Links</p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2026 Aston Recruitment. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md px-4 transition-all duration-700 ease-out ${
          showPreferenceModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800/80 bg-slate-950 min-h-[460px] flex flex-col justify-end p-6 md:p-8 text-center transition-all duration-700 ease-out transform ${
            showPreferenceModal ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
          }`}>
            {/* Full Cover Background Image with transient gradient overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="/hiring_job.jpg"
                alt="Aston Recruitment Opportunities"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/70 to-slate-950 z-10" />
            </div>

            {/* Cancel/Close Button */}
            <button
              onClick={() => {
                localStorage.setItem('user_preference', 'candidate');
                window.dispatchEvent(new Event('local-storage-pref'));
                setShowPreferenceModal(false);
              }}
              className="absolute top-4 right-4 z-30 text-slate-400 hover:text-white bg-slate-900/60 p-2 rounded-full backdrop-blur-md border border-slate-700/50 hover:border-amber-500 transition-all cursor-pointer shadow-md"
              title="Cancel and land as candidate"
              aria-label="Cancel"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Elevated Content Container */}
            <div className="relative z-20 flex flex-col items-center w-full">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
                Welcome to Aston Recruitment
              </h3>
              <p className="text-sm text-slate-300 mb-6 max-w-sm leading-relaxed">
                Let's personalize your portal experience. What are you looking to do today?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => {
                    localStorage.setItem('user_preference', 'hiring');
                    window.dispatchEvent(new Event('local-storage-pref'));
                    setShowPreferenceModal(false);
                  }}
                  className="p-5 rounded-2xl border border-slate-700/80 hover:border-amber-500 bg-slate-900/60 hover:bg-amber-500/10 text-white hover:text-amber-400 font-bold transition-all flex flex-col items-center justify-center gap-2 group backdrop-blur-md shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">💼</span>
                  <span className="text-sm">Are you hiring?</span>
                  <span className="text-[10px] text-slate-400 font-normal">Recruiter & Client tools</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('user_preference', 'candidate');
                    window.dispatchEvent(new Event('local-storage-pref'));
                    setShowPreferenceModal(false);
                  }}
                  className="p-5 rounded-2xl border border-slate-700/80 hover:border-amber-500 bg-slate-900/60 hover:bg-amber-500/10 text-white hover:text-amber-400 font-bold transition-all flex flex-col items-center justify-center gap-2 group backdrop-blur-md shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🎯</span>
                  <span className="text-sm">Looking for a job?</span>
                  <span className="text-[10px] text-slate-400 font-normal">Candidate dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Floating AI Chatbot Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-[9990]">
        {!chatbotOpen ? (
          <button
            onClick={() => setChatbotOpen(true)}
            className="w-14 h-14 rounded-full bg-amber-600 text-white shadow-xl hover:scale-105 hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer group border border-amber-500/30"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">🤖</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-3xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[400px] animate-slide-up text-left">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3.5 border-b border-slate-800 flex justify-between items-center">
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
                onClick={() => setChatbotOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.isBot ? 'items-start mr-8' : 'items-end ml-8'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.isBot 
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none' 
                      : 'bg-amber-600 text-white rounded-br-none font-semibold'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-900 bg-slate-950/50">
              {[
                "How do I register?",
                "What cities do you operate in?",
                "I want to hire candidates"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendBotMessage(chip)}
                  className="text-[9px] font-bold text-slate-300 bg-slate-900/80 hover:bg-amber-600/10 hover:text-amber-400 border border-slate-800 hover:border-amber-500/30 px-2.5 py-1 rounded-full transition-all text-left"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Footer input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const text = e.target.elements.botInput.value
                if (!text.trim()) return
                handleSendBotMessage(text)
                e.target.reset()
              }}
              className="p-3 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                name="botInput"
                placeholder="Ask something..."
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-hidden focus:border-amber-500 transition-colors"
                autoComplete="off"
              />
              <button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage
