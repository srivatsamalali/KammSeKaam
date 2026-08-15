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

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-[#faf8f2] text-slate-900">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <BrowserRouter>
            <AnimatedRoutes />
            <ChatBot />
          </BrowserRouter>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
