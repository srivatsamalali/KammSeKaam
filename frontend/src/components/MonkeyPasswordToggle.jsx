import React from 'react'

const MonkeyPasswordToggle = ({ showPassword, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[46px] w-[46px] rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-[#b88f3f] border border-slate-700/80 hover:border-[#b88f3f]/50 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-sm ${className}`}
      title={showPassword ? 'Hide password' : 'Show password'}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        /* Eye Off / Slashed Eye */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        /* Eye Open */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

export default MonkeyPasswordToggle
