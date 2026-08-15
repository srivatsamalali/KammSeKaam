import React, { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    return isDark
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
      aria-label="Toggle theme"
      type="button"
    >
      <span className="text-sm font-medium">
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </span>
    </button>
  )
}

export default ThemeToggle
