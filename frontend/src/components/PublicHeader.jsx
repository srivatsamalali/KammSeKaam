import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="glass sticky top-0 z-50 mx-4 my-4 rounded-[32px] border border-white/70 shadow-2xl bg-white/80 backdrop-blur-xl">
      <div className="w-full mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center h-auto md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Aston Recruitment"
              className="h-11 w-11 rounded-3xl object-cover shadow-lg shadow-sky-200/50"
            />
            <h1 className="text-2xl font-bold text-sky-700">
              Aston Recruitment
            </h1>
          </Link>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
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

          <div className="flex items-center gap-2 md:gap-3 relative">
            <Link to="/candidate/login" className="nav-link">
              Candidate Login
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="nav-link inline-flex items-center gap-2"
              >
                <span className="hidden md:inline">More</span>
                <span className="md:hidden inline-flex h-5 w-5 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </span>
                <span className="hidden md:inline text-slate-500">▾</span>
              </button>
              <div
                className={`dropdown-menu absolute right-0 top-full mt-3 w-48 overflow-hidden transition-all duration-200 ${
                  menuOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <Link
                  to="/recruiter/login"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/admin/login"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default PublicHeader
