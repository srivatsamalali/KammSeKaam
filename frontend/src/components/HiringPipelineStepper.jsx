import React from 'react'
import { CheckCircle2, Clock, Calendar, Award, XCircle } from 'lucide-react'

export const HiringPipelineStepper = ({ currentStatus = 'APPLIED', candidateName = '', compact = false }) => {
  const isRejected = currentStatus === 'REJECTED'

  const stages = [
    { key: 'APPLIED', label: 'Applied', icon: Clock },
    { key: 'SCREENED', label: 'Screened', icon: CheckCircle2 },
    { key: 'INTERVIEW', label: 'Interview Scheduled', icon: Calendar },
    { key: 'SELECTED', label: 'Selected & Placed', icon: Award },
  ]

  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED':
        return 0
      case 'UNDER_REVIEW':
      case 'SCREENED':
        return 1
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW':
        return 2
      case 'SELECTED':
      case 'PLACED':
        return 3
      default:
        return 0
    }
  }

  const currentIndex = getStageIndex(currentStatus)

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {stages.map((stage, idx) => {
          const isDone = !isRejected && idx <= currentIndex
          const isCurrent = !isRejected && idx === currentIndex
          return (
            <React.Fragment key={stage.key}>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : isDone
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-slate-800/40 text-slate-500'
                }`}
              >
                <span>{stage.label}</span>
              </div>
              {idx < stages.length - 1 && (
                <span className={`text-[10px] ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>→</span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full py-4 px-2 select-none">
      {isRejected ? (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <XCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold">Application Status: Not Moving Forward</p>
            <p className="text-[11px] text-rose-400/80">
              Profile reviewed. Candidate may be considered for matching future roles.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-between">
          {/* Connecting Progress Line */}
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          {stages.map((stage, idx) => {
            const Icon = stage.icon
            const isDone = idx < currentIndex
            const isCurrent = idx === currentIndex
            const isUpcoming = idx > currentIndex

            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#b88f3f] text-white shadow-[0_0_15px_rgba(184,143,63,0.6)] ring-4 ring-amber-500/20 scale-110'
                      : isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`mt-2 text-[10px] font-bold tracking-wider uppercase text-center ${
                    isCurrent
                      ? 'text-[#b88f3f] font-extrabold'
                      : isDone
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HiringPipelineStepper
