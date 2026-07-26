import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen page-shell">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 mx-4 my-4 rounded-[32px] border border-white/70 shadow-2xl bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center h-auto md:h-20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-200/50 flex items-center justify-center text-white font-bold">
                K
              </div>
              <h1 className="text-2xl font-bold text-sky-700">kaamSeKaam</h1>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <a href="#home" className="nav-link">
                Home
              </a>
              <a href="#about" className="nav-link">
                About
              </a>
              <a href="#services" className="nav-link">
                Services
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <Link to="/candidate/login" className="nav-link">
                Candidate Login
              </Link>
              <Link to="/recruiter/login" className="nav-link">
                Recruiter Login
              </Link>
              <Link to="/admin/login" className="nav-link">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="scroll-mt-28 min-h-[calc(100vh-7rem)] py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 overflow-hidden">
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
                    kaamSeKaam is your premier consultancy management portal
                    connecting talented candidates with leading recruiters.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">
              About kaamSeKaam
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 glass-card p-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">Our Services</h3>
          </div>
          <ul className="space-y-4 text-slate-600 max-w-2xl mx-auto">
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Resume Management
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Interview Scheduling
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Video Conferencing
              Integration
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Email Notifications
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Application Tracking
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-3">✓</span> Skill Matching
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 glass-card p-8">
            <div>
              <h5 className="font-bold mb-4">About</h5>
              <p className="text-gray-400 text-sm">
                Leading consultancy management platform
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact</h5>
              <p className="text-gray-400 text-sm">support@kaamsekaaam.com</p>
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
            <p>&copy; 2024 kaamSeKaam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
