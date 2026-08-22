import React from 'react'

export const SkeletonLoader = ({ rows = 4, className = '' }) => {
  return (
    <div className={`w-full space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-glass rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between"
        >
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-slate-200/50 dark:bg-slate-800/60 rounded-md w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-200/30 dark:bg-slate-800/40 rounded-md w-1/2 animate-pulse" />
          </div>
          <div className="h-8 bg-slate-200/40 dark:bg-slate-800/50 rounded-xl w-24 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader
