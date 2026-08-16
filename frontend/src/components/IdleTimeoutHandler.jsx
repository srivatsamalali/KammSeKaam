import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createPortal } from 'react-dom'

const IdleTimeoutHandler = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  
  const idleTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)

  // 5 minutes of idle time (300,000 ms)
  const IDLE_TIME = 5 * 60 * 1000

  const resetIdleTimer = () => {
    if (showWarning) return // Don't reset if warning modal is active

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(60)
    }, IDLE_TIME)
  }

  // Monitor activity
  useEffect(() => {
    if (!user) {
      // Clear timers if not logged in
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      setShowWarning(false)
      return
    }

    // Set initial timer
    resetIdleTimer()

    const events = ['keydown', 'click', 'scroll', 'touchstart']
    const handleActivity = () => resetIdleTimer()

    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [user, showWarning])

  // Warning countdown logic
  useEffect(() => {
    if (showWarning) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current)
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [showWarning])

  const handleLogout = () => {
    setShowWarning(false)
    logout()
    navigate('/')
  }

  const handleStayLoggedIn = () => {
    setShowWarning(false)
    resetIdleTimer()
  }

  if (!showWarning) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#2b2f3a] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center text-slate-800 dark:text-white">
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="rgba(217, 119, 6, 0.1)"
              strokeWidth="5"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="#d97706"
              strokeWidth="5"
              strokeDasharray="238.76"
              strokeDashoffset={238.76 - (countdown / 60) * 238.76}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter animate-in zoom-in duration-200" key={countdown}>
              {countdown}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">secs</span>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Idle Timeout Warning</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          You have been idle for a while. For security reasons, you will be logged out automatically.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 15px rgba(217,119,6,0.4)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default IdleTimeoutHandler
