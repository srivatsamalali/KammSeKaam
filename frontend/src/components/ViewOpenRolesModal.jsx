import React, { useState, useEffect } from 'react'
import { jobService, candidateService } from '../services/api'
import { Link } from 'react-router-dom'

const ViewOpenRolesModal = ({ isOpen, onClose, isLoggedIn = false }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [applyingJobIds, setApplyingJobIds] = useState({})
  const [appliedJobIds, setAppliedJobIds] = useState({})

  const handleApplyDirectly = async (job) => {
    setApplyingJobIds(prev => ({ ...prev, [job.id]: true }))
    try {
      await candidateService.applyJob({
        jobId: job.id,
        jobTitle: job.title,
        department: job.department,
        location: job.location
      })
      setAppliedJobIds(prev => ({ ...prev, [job.id]: true }))
      alert(`Success! Your application for "${job.title}" has been submitted directly in the portal. Admin has been notified via email and portal notification.`)
    } catch (err) {
      console.error('Error applying directly:', err)
      alert(err.response?.data?.message || 'Failed to submit application. Please try again.')
    } finally {
      setApplyingJobIds(prev => ({ ...prev, [job.id]: false }))
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchJobs()
    }
  }, [isOpen])

  const fetchJobs = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await jobService.getAll()
      const openJobs = (data.data || data).filter(j => j.status === 'OPEN')
      setJobs(openJobs)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to fetch open roles. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const departments = ['All', ...new Set(jobs.map(j => j.department))]

  const filteredJobs = jobs.filter(j => {
    const matchesDept = selectedDept === 'All' || j.department === selectedDept
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDept && matchesSearch
  })

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-slate-950/80 backdrop-blur-md p-4 pt-12 sm:pt-24 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-3xl max-w-5xl w-full max-h-[85vh] flex flex-col relative animate-in slide-in-from-bottom-4 duration-300 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-[#b88f3f]">
              Open Opportunities
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">
              Click on any role tile below to expand and view the full Job Description (JD).
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors p-2 hover:bg-gray-150 dark:hover:bg-slate-800 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search controls */}
        <div className="p-6 bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800/60 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Search roles, skills, or locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-hidden focus:border-[#b88f3f] dark:focus:border-[#b88f3f] transition-colors"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-hidden focus:border-[#b88f3f] dark:focus:border-[#b88f3f] transition-colors"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-[#b88f3f] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Loading opportunities...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm font-semibold">{error}</p>
              <button 
                onClick={fetchJobs}
                className="mt-4 bg-[#b88f3f]/10 hover:bg-[#b88f3f]/25 text-[#b88f3f] font-bold text-xs px-4 py-2 rounded-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">No open opportunities match your filters.</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Check back later or register to get notified of new matching positions.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isExpanded = expandedJobId === job.id
              return (
                <div 
                  key={job.id} 
                  className="bg-gray-50/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800/80 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 transition-colors"
                >
                  {/* Long Horizontal Tile */}
                  <div 
                    onClick={() => toggleExpand(job.id)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-900/40 select-none transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="bg-[#b88f3f]/10 text-[#b88f3f] text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          {job.department}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white font-serif tracking-tight truncate sm:max-w-md md:max-w-lg">
                        {job.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md">
                        <span>📍</span>
                        <span className="font-semibold">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md">
                        <span>💼</span>
                        <span className="font-semibold">{job.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md">
                        <span>💰</span>
                        <span className="font-semibold">{job.salary || 'Market Standards'}</span>
                      </div>
                      <div className="ml-2 text-gray-400 dark:text-slate-450 text-sm">
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content View (JD + Apply Controls) */}
                  {isExpanded && (
                    <div className="p-6 border-t border-gray-200 dark:border-slate-850 bg-gray-100/30 dark:bg-slate-900/20 text-left space-y-6 animate-in slide-in-from-top duration-200">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-[#b88f3f] font-bold mb-1.5">Job Description</h4>
                          {/* PRESERVES WHITE SPACE AND FORMATTING */}
                          <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                            {job.description}
                          </div>
                        </div>

                        {job.requirements && (
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold mb-1">Key Requirements / Skills Stack</h4>
                            <div className="text-xs text-gray-600 dark:text-slate-350 bg-gray-100/40 dark:bg-slate-950/45 p-3 rounded-lg border border-gray-200 dark:border-slate-850/60 font-mono">
                              {job.requirements}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Apply Button Block */}
                      <div className="pt-2 border-t border-gray-200 dark:border-slate-850/60 flex justify-end gap-3 flex-wrap">
                        {job.applyUrl && (
                          <a 
                            href={job.applyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#b88f3f]/20 hover:bg-[#b88f3f]/30 border border-[#b88f3f]/40 text-[#b88f3f] font-bold text-xs px-6 py-2.5 rounded-lg text-center tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            APPLY VIA EXTERNAL FORM →
                          </a>
                        )}
                        {isLoggedIn ? (
                          appliedJobIds[job.id] ? (
                            <div className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 font-bold text-xs px-5 py-2.5 rounded-lg text-center">
                              Applied via Portal ✓
                            </div>
                          ) : (
                            <button
                              disabled={applyingJobIds[job.id]}
                              onClick={() => handleApplyDirectly(job)}
                              className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-6 py-2.5 rounded-lg text-center tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {applyingJobIds[job.id] ? 'APPLYING...' : 'APPLY IN PORTAL →'}
                            </button>
                          )
                        ) : (
                          <Link 
                            to="/candidate/register" 
                            onClick={onClose}
                            className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-6 py-2.5 rounded-lg text-center tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            REGISTER TO APPLY →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewOpenRolesModal
