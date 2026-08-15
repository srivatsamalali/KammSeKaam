import React, { useState, useEffect, useRef } from 'react'

const MonkeyPasswordToggle = ({ showPassword, onClick }) => {
  const containerRef = useRef(null)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Only track if eyes are open (showPassword is false)
    if (showPassword) return

    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Center of container
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Vector from center to cursor
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy) || 1

      // Limit pupil translation to max 3.5 units
      const maxLimit = 3.5
      const limit = Math.min(distance * 0.1, maxLimit)
      const offset = {
        x: (dx / distance) * limit,
        y: (dy / distance) * limit
      }
      setPupilOffset(offset)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [showPassword])

  return (
    <div className="flex flex-col items-center mb-2 animate-fade-in select-none">
      <div 
        ref={containerRef}
        onClick={onClick}
        className="relative w-20 h-20 cursor-pointer group bg-slate-50 dark:bg-slate-800/40 rounded-full border border-slate-200/50 dark:border-slate-800/60 p-2 shadow-inner hover:scale-105 transition-all duration-300 flex items-center justify-center"
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-md"
        >
          {/* Ears */}
          <circle cx="20" cy="50" r="14" fill="#a0522d" />
          <circle cx="20" cy="50" r="8" fill="#ffdab9" />
          
          <circle cx="80" cy="50" r="14" fill="#a0522d" />
          <circle cx="80" cy="50" r="8" fill="#ffdab9" />

          {/* Head Base */}
          <circle cx="50" cy="50" r="38" fill="#a0522d" />
          
          {/* Face Area */}
          <ellipse cx="50" cy="56" rx="30" ry="26" fill="#ffdab9" />
          
          {/* Eyes (Open if showPassword is FALSE, Closed if showPassword is TRUE) */}
          {!showPassword ? (
            <>
              {/* Eyes Open */}
              <ellipse cx="38" cy="46" rx="6" ry="8" fill="#ffffff" stroke="#a0522d" strokeWidth="1" />
              <ellipse cx="62" cy="46" rx="6" ry="8" fill="#ffffff" stroke="#a0522d" strokeWidth="1" />
              {/* Pupil with cursor-tracking coordinates offset */}
              <circle cx={38 + pupilOffset.x} cy={46 + pupilOffset.y} r="3.5" fill="#333333" />
              <circle cx={62 + pupilOffset.x} cy={46 + pupilOffset.y} r="3.5" fill="#333333" />
            </>
          ) : (
            <>
              {/* Eyes Covered/Closed */}
              <path d="M 32 46 Q 38 41 44 46" stroke="#8b4513" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 56 46 Q 62 41 68 46" stroke="#8b4513" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Nose & Mouth */}
          <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#8b4513" />
          {!showPassword ? (
            /* Open smile */
            <path d="M 42 70 Q 50 78 58 70" stroke="#8b4513" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : (
            /* Shy smile */
            <path d="M 44 71 Q 50 74 56 71" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* Hands overlaying/covering eyes */}
          <g className="transition-all duration-500 ease-in-out">
            <circle 
              cx={!showPassword ? "22" : "34"} 
              cy={!showPassword ? "82" : "48"} 
              r="12" 
              fill="#a0522d" 
              stroke="#8b4513" 
              strokeWidth="2" 
              className="transition-all duration-500 ease-in-out"
            />
            <circle 
              cx={!showPassword ? "78" : "66"} 
              cy={!showPassword ? "82" : "48"} 
              r="12" 
              fill="#a0522d" 
              stroke="#8b4513" 
              strokeWidth="2" 
              className="transition-all duration-500 ease-in-out"
            />
          </g>
        </svg>

        {/* Small badge overlay */}
        <span className="absolute bottom-1 bg-amber-600 text-white font-black text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white dark:border-slate-800 scale-95 shadow-sm">
          {showPassword ? 'Hide' : 'Show'}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 font-semibold mt-1">
        {!showPassword ? '👀 Watching...' : '🙈 Closed!'}
      </span>
    </div>
  )
}

export default MonkeyPasswordToggle
