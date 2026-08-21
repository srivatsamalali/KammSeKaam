import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { messageService } from '../services/api'
import { triggerMessageNotification, playSoftChime } from '../utils/notification'

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const lastCheckedRef = useRef({})

  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientForm, setClientForm] = useState({
    from: '',
    company: '',
    subject: '',
    body: ''
  })

  // State to handle hovered nav menus
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    const handleOpenModal = () => setClientModalOpen(true)
    window.addEventListener('aston-open-client-modal', handleOpenModal)
    return () => window.removeEventListener('aston-open-client-modal', handleOpenModal)
  }, [])

  const handleSendClientEmail = (e) => {
    e.preventDefault()
    if (!clientForm.company.trim()) {
      alert('Company Name is required')
      return
    }
    triggerMessageNotification('System', 'Registration request sent successfully to Aston Recruitment!')
    setClientModalOpen(false)
    setClientForm({
      from: 'sender@companymail.com',
      company: '',
      body: ''
    })
  }

  const getInitialPref = () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userObj = JSON.parse(localStorage.getItem('user') || '{}')
        if (userObj.role === 'CANDIDATE') return 'candidate'
        if (userObj.role === 'RECRUITER' || userObj.role === 'ADMIN') return 'hiring'
      } catch (e) {}
    }
    return localStorage.getItem('user_preference') || ''
  }

  const [userPref, setUserPref] = useState(getInitialPref)

  useEffect(() => {
    const handlePrefChange = () => {
      setUserPref(getInitialPref())
    }
    window.addEventListener('local-storage-pref', handlePrefChange)
    return () => window.removeEventListener('local-storage-pref', handlePrefChange)
  }, [])

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored ? (stored === 'dark') : true; // Default to dark mode strictly
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return isDark;
  })

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  }



  let activeIndex = 0
  let totalTabs = 1

  if (userPref === 'candidate') {
    totalTabs = 2
    if (location.pathname.startsWith('/candidate')) {
      activeIndex = 1
    }
  } else if (userPref === 'hiring') {
    totalTabs = 3
    if (location.pathname.startsWith('/recruiter')) {
      activeIndex = 1
    } else if (location.pathname.startsWith('/admin')) {
      activeIndex = 2
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#090f19] border-b border-slate-800/60 px-6 sm:px-12 py-2.5 shadow-2xl transition-all duration-300">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity no-underline" style={{ textDecoration: 'none' }}>
              <img
                src="/aston-logo-transparent.png"
                alt="Aston Logo"
                className="h-20 w-20 object-contain"
              />
              <div className="flex flex-col items-center text-center leading-none" style={{ textDecoration: 'none' }}>
                <span className="text-2xl font-bold tracking-widest text-white font-serif no-underline" style={{ fontFamily: 'Georgia, serif', textDecoration: 'none' }}>ASTON</span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#b88f3f] uppercase mt-1.5 no-underline" style={{ textDecoration: 'none' }}>— RECRUITMENT —</span>
              </div>
            </Link>

            {/* Desktop Navigation Links with Dropdowns */}
            <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-white select-none">
              {!user && (
                <>
                  {/* Clients Dropdown */}
                  <div 
                    className="relative py-3.5 cursor-pointer"
                    onMouseEnter={() => setActiveDropdown('clients')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div 
                      onClick={() => setClientModalOpen(true)}
                      className="hover:text-[#b88f3f] transition-colors flex items-center gap-1.5 focus:outline-hidden"
                    >
                      <span>For Clients</span>
                      <span className="text-[9px] opacity-80">▼</span>
                    </div>
                    {activeDropdown === 'clients' && (
                      <div className="absolute top-full left-0 w-60 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <div 
                          onClick={() => setClientModalOpen(true)} 
                          className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40"
                        >
                          💼 Register Company Request
                        </div>
                        <Link 
                          to="/recruiter/login" 
                          className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40"
                        >
                          🛡️ Expert Portal Login
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Candidates Dropdown */}
                  <div 
                    className="relative py-3.5 cursor-pointer"
                    onMouseEnter={() => setActiveDropdown('candidates')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div 
                      onClick={() => navigate('/candidate/login')}
                      className="hover:text-[#b88f3f] transition-colors flex items-center gap-1.5 focus:outline-hidden"
                    >
                      <span>For Candidates</span>
                      <span className="text-[9px] opacity-80">▼</span>
                    </div>
                    {activeDropdown === 'candidates' && (
                      <div className="absolute top-full left-0 w-60 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <Link 
                          to="/candidate/login" 
                          className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40"
                        >
                          🔑 Candidate Login
                        </Link>
                        <Link 
                          to="/candidate/register" 
                          className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40"
                        >
                          ✍️ Candidate Registration
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Aston Experts Dropdown */}
                  <div 
                    className="relative py-3.5 cursor-pointer"
                    onMouseEnter={() => setActiveDropdown('experts')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div 
                      className="hover:text-[#b88f3f] transition-colors flex items-center gap-1.5 focus:outline-hidden"
                    >
                      <span>Aston Experts</span>
                      <span className="text-[9px] opacity-80">▼</span>
                    </div>
                    {activeDropdown === 'experts' && (
                      <div className="absolute top-full left-0 w-60 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <Link 
                          to="/recruiter/login" 
                          className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40"
                        >
                          🛡️ Expert Portal Login
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* About Us Dropdown */}
                  <div 
                    className="relative py-3.5 cursor-pointer"
                    onMouseEnter={() => setActiveDropdown('about')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div 
                      className="hover:text-[#b88f3f] transition-colors flex items-center gap-1.5 focus:outline-hidden"
                    >
                      <span>About Us</span>
                      <span className="text-[9px] opacity-80">▼</span>
                    </div>
                    {activeDropdown === 'about' && (
                      <div className="absolute top-full left-0 w-60 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <a href="/#about" className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40">👥 Who We Are</a>
                        <a href="/#about" className="block text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/40">✍️ Founder Note</a>
                      </div>
                    )}
                  </div>

                  <a 
                    href="https://www.linkedin.com/company/aston-recruitment-india/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#b88f3f] transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </>
              )}
            </div>

            {/* Desktop Action Buttons / User Dropdown */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors focus:outline-hidden"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {user ? (
                <div 
                  className="relative py-3.5 cursor-pointer z-[9999]"
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="flex items-center gap-2 px-4 py-2 border border-slate-700/60 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
                    <span className="text-xs font-semibold text-white">👤 {user.name || user.email}</span>
                    <span className="text-[9px] text-[#b88f3f]">▼</span>
                  </div>
                  {activeDropdown === 'user' && (
                    <div 
                      className="absolute right-0 top-full w-48 backdrop-blur-lg border border-slate-800 rounded-xl p-3 shadow-2xl z-[9999] text-left space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300"
                      style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}
                    >
                      <Link 
                        to={
                          user.role === 'ADMIN' ? '/admin/dashboard' :
                          user.role === 'RECRUITER' ? '/recruiter/dashboard' :
                          '/candidate/dashboard'
                        }
                        className="block text-xs text-slate-200 font-bold hover:text-[#b88f3f] py-1.5 px-2.5 rounded-lg hover:bg-slate-800/40 transition-all duration-200"
                      >
                        📊 Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left block text-xs text-red-400 font-bold hover:text-red-300 py-1.5 px-2.5 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/candidate/register" 
                  className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg hover:shadow-amber-500/10 transition-all duration-300 uppercase tracking-wider transform hover:scale-[1.02]"
                >
                  Candidate Registration
                </Link>
              )}
            </div>

            {/* Mobile Actions Menu toggle */}
            <div className="flex md:hidden items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/40 text-xs text-slate-300 hover:text-white transition-colors focus:outline-hidden"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link 
                    to={
                      user.role === 'ADMIN' ? '/admin/dashboard' :
                      user.role === 'RECRUITER' ? '/recruiter/dashboard' :
                      '/candidate/dashboard'
                    }
                    className="bg-[#b88f3f] text-white font-semibold text-xs px-3.5 py-1.5 rounded-md"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={logout}
                    className="bg-red-550/10 text-red-400 border border-red-500/20 font-semibold text-xs px-3 py-1.5 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/candidate/register" className="bg-[#b88f3f] text-white font-semibold text-xs px-3.5 py-2 rounded-md">
                  Register
                </Link>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Premium Clients Registration Email Modal */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-8 shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setClientModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold tracking-tight mb-2 font-serif text-[#b88f3f]">
              Register Company Request
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Send a request to register your company. Aston Recruitment will contact you shortly.
            </p>
            <form onSubmit={handleSendClientEmail} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</label>
                <input 
                  type="email" 
                  placeholder="sender@companymail.com"
                  value={clientForm.from}
                  onChange={(e) => setClientForm(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">To</label>
                <input 
                  type="email" 
                  placeholder="contact@astonrecruitment.in" 
                  className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-550 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Corp"
                  value={clientForm.company}
                  onChange={(e) => setClientForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder={`Register yourself as ${clientForm.company || '[Company]'}`}
                  value={clientForm.subject}
                  onChange={(e) => setClientForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Body</label>
                <textarea 
                  rows={4}
                  placeholder="Describe your hiring requirements..."
                  value={clientForm.body}
                  onChange={(e) => setClientForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setClientModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-350 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white px-5 py-2 text-xs font-bold rounded-lg transition-colors shadow-lg"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Rendered outside to prevent fixed placement container constraint bugs) */}
      {createPortal(
        <div className="mobile-bottom-nav select-none" style={{ padding: '8px !important' }}>
          {/* iOS Liquid Glass sliding pill */}
          <div
            className="absolute rounded-[24px] pointer-events-none transition-all"
            style={{
              zIndex: 0,
              top: '8px',
              bottom: '8px',
              left: '8px',
              width: `calc((100% - 16px) / ${totalTabs})`,
              transform: `translate3d(calc(${activeIndex} * 100%), 0, 0)`,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.16))',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.75),
                inset 0 -1px 1px rgba(255,255,255,0.15),
                0 8px 25px rgba(31,38,135,0.18)
              `,
              transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />

          <Link 
            to="/" 
            onClick={(e) => {
              playSoftChime()
              if (location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }} 
            className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${location.pathname === '/' ? 'active-mobile-tab' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          {userPref === 'candidate' && (
            <Link to="/candidate/login" onClick={playSoftChime} className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${location.pathname.startsWith('/candidate') ? 'active-mobile-tab' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-[10px] font-bold">Candidate</span>
            </Link>
          )}
          {userPref === 'hiring' && (
            <>
              <Link to="/recruiter/login" onClick={playSoftChime} className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${location.pathname.startsWith('/recruiter') ? 'active-mobile-tab' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span className="text-[10px] font-bold">Expert</span>
              </Link>
              <Link to="/admin/login" onClick={playSoftChime} className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${location.pathname.startsWith('/admin') ? 'active-mobile-tab' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                <span className="text-[10px] font-bold">Admin</span>
              </Link>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

export default PublicHeader
