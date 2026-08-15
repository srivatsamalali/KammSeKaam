import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PublicHeader = () => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  return (
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
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#8c6a23' }}>
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

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              type="button"
              className="nav-link inline-flex items-center justify-center p-2 rounded-full"
              style={{ padding: '0.6rem' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

         {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2 border-t border-slate-100 flex flex-col gap-3">
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="nav-link justify-start gap-2 font-bold"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <Link
              to="/#home"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/#services"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <hr className="border-slate-100 my-1" />
            <Link
              to="/candidate/login"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Candidate Login
            </Link>
            <Link
              to="/recruiter/login"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recruiter Login
            </Link>
            <Link
              to="/admin/login"
              className="nav-link justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default PublicHeader
