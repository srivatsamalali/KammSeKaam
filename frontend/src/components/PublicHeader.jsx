import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { 
  Building2, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Users, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  Sun, 
  Moon, 
  ChevronDown 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { messageService, clientRequestService } from '../services/api'
import { triggerMessageNotification, playSoftChime } from '../utils/notification'

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const lastCheckedRef = useRef({})

  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    from: '',
    phone: '',
    company: '',
    subject: '',
    body: ''
  })
  const [submittingClient, setSubmittingClient] = useState(false)

  // State to handle hovered nav menus
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    const handleOpenModal = () => setClientModalOpen(true)
    window.addEventListener('aston-open-client-modal', handleOpenModal)
    return () => window.removeEventListener('aston-open-client-modal', handleOpenModal)
  }, [])

  const handleSendClientEmail = async (e) => {
    e.preventDefault()
    if (!clientForm.company.trim()) {
      alert('Company Name is required')
      return
    }
    if (!clientForm.from.trim()) {
      alert('Work Email is required')
      return
    }
    if (!clientForm.body.trim()) {
      alert('Hiring Requirements are required')
      return
    }

    try {
      setSubmittingClient(true)
      await clientRequestService.submit({
        name: clientForm.name,
        company: clientForm.company,
        email: clientForm.from,
        phone: clientForm.phone,
        subject: clientForm.subject,
        requirements: clientForm.body,
      })
      triggerMessageNotification('System', 'Hiring request submitted successfully! Aston Recruitment will review and contact you shortly.')
      setClientModalOpen(false)
      setClientForm({
        name: '',
        from: '',
        phone: '',
        company: '',
        subject: '',
        body: ''
      })
    } catch (err) {
      console.error('Submit client request error:', err)
      alert(err.response?.data?.message || 'Failed to submit hiring request. Please try again.')
    } finally {
      setSubmittingClient(false)
    }
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



  // Polling for incoming messages to trigger sound/banner
  useEffect(() => {
    if (!user) return

    const checkNewMessages = async () => {
      try {
        const res = await messageService.getConversations()
        const convos = res.data || []
        
        let hasNew = false
        convos.forEach(c => {
          if (c.lastMessage) {
            const lastId = c.lastMessage.id
            const prevId = lastCheckedRef.current[c.id]
            
            // If message exists, sender is someone else, and it wasn't seen in this session yet
            if (prevId && prevId !== lastId && c.lastMessage.senderId !== user.id) {
              hasNew = true
              triggerMessageNotification(c.partner?.name || 'Recruiter/Candidate', c.lastMessage.content)
            }
            lastCheckedRef.current[c.id] = lastId
          }
        })
      } catch (err) {
        // Silently catch background poll error
      }
    }

    const interval = setInterval(checkNewMessages, 7000)
    return () => clearInterval(interval)
  }, [user])

  // Get active bottom nav index for iOS Liquid Glass sliding pill
  const getBottomNavIndex = () => {
    const p = location.pathname
    if (p === '/') return 0
    if (p.includes('/about')) return 1
    if (p.includes('/login') || p.includes('/register')) return 2
    if (p.includes('/dashboard') || p.includes('/chat')) return 3
    return 0
  }

  const activeIndex = getBottomNavIndex()
  const totalTabs = 4

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans border-b border-white/10" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            
            {/* Brand / Logo */}
            <Link to="/" className="flex items-center gap-3 select-none no-underline" style={{ textDecoration: 'none' }}>
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
                      <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
                    </div>
                    {activeDropdown === 'clients' && (
                      <div className="absolute top-full left-0 w-64 backdrop-blur-lg border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <div 
                          onClick={() => setClientModalOpen(true)} 
                          className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60"
                        >
                          <Building2 className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Register Company Request</span>
                        </div>
                        <Link 
                          to="/recruiter/login" 
                          className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Expert Portal Login</span>
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
                      <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
                    </div>
                    {activeDropdown === 'candidates' && (
                      <div className="absolute top-full left-0 w-64 backdrop-blur-lg border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <Link 
                          to="/candidate/login" 
                          className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60"
                        >
                          <LogIn className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Candidate Login</span>
                        </Link>
                        <Link 
                          to="/candidate/register" 
                          className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60"
                        >
                          <UserPlus className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Candidate Registration</span>
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
                      <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
                    </div>
                    {activeDropdown === 'experts' && (
                      <div className="absolute top-full left-0 w-64 backdrop-blur-lg border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <Link 
                          to="/recruiter/login" 
                          className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Expert Portal Login</span>
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
                      <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
                    </div>
                    {activeDropdown === 'about' && (
                      <div className="absolute top-full left-0 w-64 backdrop-blur-lg border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}>
                        <a href="/#about" className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60">
                          <Users className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Who We Are</span>
                        </a>
                        <a href="/#about" className="text-xs hover:text-[#b88f3f] text-slate-200 font-bold transition-all duration-200 flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-800/60">
                          <FileText className="w-4 h-4 text-[#b88f3f] shrink-0" />
                          <span>Founder Note</span>
                        </a>
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
                className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors focus:outline-hidden cursor-pointer"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>

              {user ? (
                <div 
                  className="relative py-3.5 cursor-pointer z-[9999]"
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="flex items-center gap-2 px-4 py-2 border border-slate-700/60 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
                    <UserIcon className="w-3.5 h-3.5 text-[#b88f3f]" />
                    <span className="text-xs font-semibold text-white">{user.name || user.email}</span>
                    <ChevronDown className="w-3 h-3 text-[#b88f3f]" />
                  </div>
                  {activeDropdown === 'user' && (
                    <div 
                      className="absolute right-0 top-full w-48 backdrop-blur-lg border border-slate-800 rounded-xl p-2 shadow-2xl z-[9999] text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300"
                      style={{ backgroundColor: 'rgba(12, 19, 34, 0.98)' }}
                    >
                      <Link 
                        to={
                          user.role === 'ADMIN' ? '/admin/dashboard' :
                          user.role === 'RECRUITER' ? '/recruiter/dashboard' :
                          '/candidate/dashboard'
                        }
                        className="w-full flex items-center justify-start gap-2.5 text-xs text-slate-200 font-bold hover:text-[#b88f3f] py-2 px-3 rounded-lg hover:bg-slate-800/60 transition-all duration-200 text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#b88f3f] shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center justify-start gap-2.5 text-xs text-rose-400 font-bold hover:text-rose-300 py-2 px-3 rounded-lg hover:bg-rose-500/15 transition-all duration-200 cursor-pointer text-left"
                        style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none', justifyContent: 'flex-start' }}
                      >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Logout</span>
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
                className="p-2 rounded-lg border border-slate-700/60 bg-slate-900/40 text-xs text-slate-300 hover:text-white transition-colors focus:outline-hidden"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
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
                    type="button"
                    onClick={logout}
                    className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-xs px-3 py-1.5 rounded-md hover:bg-rose-500/20 transition-colors cursor-pointer"
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
      </header>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={clientForm.name}
                    onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    value={clientForm.company}
                    onChange={(e) => setClientForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Email *</label>
                  <input 
                    type="email" 
                    placeholder="contact@company.com"
                    value={clientForm.from}
                    onChange={(e) => setClientForm(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder={`Hiring requirement for ${clientForm.company || 'our team'}`}
                  value={clientForm.subject}
                  onChange={(e) => setClientForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hiring Requirements & Roles *</label>
                <textarea 
                  rows={4}
                  placeholder="Describe your hiring requirements, desired skills, experience levels, and timeline..."
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
                  disabled={submittingClient}
                  className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white px-5 py-2 text-xs font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingClient ? 'Submitting...' : 'Send Request'}
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
