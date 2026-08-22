import React from 'react'

export const FloatingBadge = ({
  icon,
  title,
  subtitle,
  variant = '1', // '1' or '2' for differing float bob frequencies
  className = '',
}) => {
  const animClass = variant === '1' ? 'animate-float-1' : 'animate-float-2'

  return (
    <div
      className={`hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#090f19]/80 border border-amber-500/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] select-none z-20 ${animClass} ${className}`}
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#b88f3f] shrink-0">
        {icon}
      </div>
      <div className="text-left leading-tight">
        <p className="text-[11px] font-bold text-white tracking-tight">{title}</p>
        {subtitle && <p className="text-[9px] text-[#b88f3f] font-semibold">{subtitle}</p>}
      </div>
    </div>
  )
}

export default FloatingBadge
