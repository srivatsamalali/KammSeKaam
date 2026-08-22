import React from 'react'

export const ExecutiveTicker = ({ items = [] }) => {
  const defaultItems = [
    { title: 'VP of Engineering', location: 'Bengaluru', status: 'Active Opening', dept: 'Technology' },
    { title: 'Principal GCC Architect', location: 'Hyderabad', status: 'Executive Search', dept: 'GCCs' },
    { title: 'Head of Quantitative Risk', location: 'Mumbai', status: 'Final Rounds', dept: 'BFSI' },
    { title: 'Director of AI / ML', location: 'Bengaluru', status: 'Aston Verified', dept: 'Technology' },
    { title: 'Global Operations Lead', location: 'Remote / Delhi', status: 'Active Opening', dept: 'Operations' },
    { title: 'Senior Director, Product Growth', location: 'Bengaluru', status: 'Aston Verified', dept: 'Corporate' },
  ]

  const displayItems = items.length > 0 ? items : defaultItems

  return (
    <div className="w-full bg-[#070c14] border-y border-amber-500/20 py-2.5 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-track flex items-center">
          {displayItems.concat(displayItems).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 text-xs shrink-0 select-none text-slate-300 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="font-bold text-white tracking-wide">{item.title}</span>
              <span className="text-[#b88f3f] font-semibold text-[10px] uppercase bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                {item.dept}
              </span>
              <span className="text-slate-400 text-[11px]">📍 {item.location}</span>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                {item.status}
              </span>
              <span className="text-slate-600 ml-2">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExecutiveTicker
