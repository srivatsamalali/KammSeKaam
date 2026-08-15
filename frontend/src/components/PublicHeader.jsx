import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'

const PublicHeader = () => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getActiveIndex = () => {
    const path = window.location.pathname
    if (path === '/') return 0
    if (path.startsWith('/candidate')) return 1
    if (path.startsWith('/recruiter')) return 2
    if (path.startsWith('/admin')) return 3
    return -1
  }
  const activeIndex = getActiveIndex()

  const [darkMode, setDarkMode] = useState(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  const isDashboard = window.location.pathname.includes('/dashboard') || window.location.pathname.includes('/meeting')
  if (isDashboard) return null

  return (
    <>
      <nav className="glass sticky top-0 z-50 mx-4 my-4 rounded-[32px] border border-white/70 shadow-2xl bg-white/80 backdrop-blur-xl">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Aston Recruitment"
              className="h-11 w-11 rounded-3xl object-cover shadow-lg shadow-amber-200/50"
            />
            <h1 className="text-sm sm:text-2xl font-bold truncate max-w-[150px] sm:max-w-none" style={{ color: '#8c6a23' }}>
              Aston Recruitment
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/#home" className="nav-link">
              Home
            </Link>
            <Link to="/#about" className="nav-link">
              About
            </Link>
            <Link to="/#services" className="nav-link">
              Services
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3 relative">
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2.5 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors text-slate-700 font-bold border border-amber-200/50"
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/candidate/login" className="nav-link">
              Candidate Login
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setMoreMenuOpen(true)}
              onMouseLeave={() => setMoreMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                className="nav-link inline-flex items-center gap-2"
              >
                <span>More</span>
                <span className="text-slate-500">▾</span>
              </button>
              <div
                className={`dropdown-menu absolute right-0 top-full mt-3 w-48 overflow-hidden transition-all duration-200 ${
                  moreMenuOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <Link
                  to="/recruiter/login"
                  className="dropdown-item"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/admin/login"
                  className="dropdown-item"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Bottom Navigation Bar (Rendered outside to prevent fixed placement container constraint bugs) */}
      {createPortal(
        <div className="mobile-bottom-nav">
          {activeIndex !== -1 && (
            <div 
              className="mobile-active-indicator" 
              style={{ 
                left: `calc(20% * ${activeIndex} + 8px)`,
                width: 'calc(20% - 16px)'
              }} 
            />
          )}
          <Link to="/" className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${window.location.pathname === '/' ? 'active-mobile-tab' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/candidate/login" className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${window.location.pathname.startsWith('/candidate') ? 'active-mobile-tab' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[10px] font-bold">Candidate</span>
          </Link>
          <Link to="/recruiter/login" className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${window.location.pathname.startsWith('/recruiter') ? 'active-mobile-tab' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="text-[10px] font-bold">Recruiter</span>
          </Link>
          <Link to="/admin/login" className={`flex flex-col items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500 ${window.location.pathname.startsWith('/admin') ? 'active-mobile-tab' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span className="text-[10px] font-bold">Admin</span>
          </Link>
          <div onClick={toggleTheme} className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-500 cursor-pointer">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.94-8.94h-2.25M4.14 12H1.89m17.91-6.84l-1.59 1.59m-11.83 11.83l-1.59 1.59m15.91 0l-1.59-1.59m-11.83-11.83l-1.59-1.59M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
            <span className="text-[10px] font-bold">Theme</span>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default PublicHeader
