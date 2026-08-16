import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/ChatBot'

// Pages
import LandingPage from './pages/LandingPage'
import CandidateRegister from './pages/CandidateRegister'
import CandidateLogin from './pages/CandidateLogin'
import ForgotPassword from './pages/ForgotPassword'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterLogin from './pages/RecruiterLogin'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MeetingRoom from './pages/MeetingRoom'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/meeting/:roomId" element={<MeetingRoom />} />

        {/* Protected Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute requiredRole="CANDIDATE">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

// Styles
import './styles/index.css'
import PublicHeader from './components/PublicHeader'

function App() {
  const [customAlert, setCustomAlert] = useState({ isOpen: false, message: '' })

  useEffect(() => {
    window.alert = (message) => {
      setCustomAlert({ isOpen: true, message: String(message) })
    }
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <BrowserRouter>
            <PublicHeader />
            <AnimatedRoutes />
            <ChatBot />
          </BrowserRouter>
        </div>
      </div>

      {/* Global Frosted Liquid Glass Alert Modal */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2b2f3a] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center text-slate-800 dark:text-white">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4 font-bold">
              ℹ️
            </div>
            <h3 className="text-base font-bold mb-2">Notification</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed whitespace-pre-wrap">{customAlert.message}</p>
            <button
              onClick={() => setCustomAlert({ isOpen: false, message: '' })}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 15px rgba(217,119,6,0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AuthProvider>
  )
}

export default App
