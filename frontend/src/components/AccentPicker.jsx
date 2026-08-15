import React, { useState, useEffect } from 'react'

const accents = [
  { name: 'Aston Gold', color: '#b88f3f', hover: '#9c762f', glow: 'rgba(184,143,63,0.18)' },
  { name: 'Sapphire Blue', color: '#3b82f6', hover: '#2563eb', glow: 'rgba(59,130,246,0.18)' },
  { name: 'Emerald Green', color: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.18)' },
  { name: 'Velvet Purple', color: '#8b5cf6', hover: '#7c3aed', glow: 'rgba(139,92,246,0.18)' },
  { name: 'Crimson Red', color: '#ef4444', hover: '#dc2626', glow: 'rgba(239,68,68,0.18)' }
]

const AccentPicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeAccent, setActiveAccent] = useState(accents[0].name)

  useEffect(() => {
    const saved = localStorage.getItem('theme-accent')
    if (saved) {
      const match = accents.find(a => a.name === saved)
      if (match) {
        applyAccent(match)
      }
    }
  }, [])

  const applyAccent = (accent) => {
    setActiveAccent(accent.name)
    localStorage.setItem('theme-accent', accent.name)
    document.documentElement.style.setProperty('--accent-color', accent.color)
    document.documentElement.style.setProperty('--accent-color-hover', accent.hover)
    document.documentElement.style.setProperty('--accent-bg-glow', accent.glow)
  }

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105 hover:shadow-md transition-all"
        title="Customize Theme Accent"
      >
        <span className="text-sm">🎨</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 animate-slide-up">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 px-1">Theme Accent</span>
            <div className="space-y-1.5">
              {accents.map((acc) => (
                <button
                  key={acc.name}
                  onClick={() => {
                    applyAccent(acc)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all ${
                    activeAccent === acc.name 
                      ? 'text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800' 
                      : 'text-slate-550 dark:text-slate-400'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/5 dark:border-white/5" 
                    style={{ backgroundColor: acc.color }}
                  />
                  <span>{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AccentPicker
