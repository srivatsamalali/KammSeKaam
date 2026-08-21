import React, { useState, useEffect } from 'react'
import { jobService } from '../services/api'
import { Link } from 'react-router-dom'

const ViewOpenRolesModal = ({ isOpen, onClose, isLoggedIn = false }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

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
      // Filter open jobs
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

  // Get unique departments for filter
  const departments = ['All', ...new Set(jobs.map(j => j.department))]

  // Filter jobs based on selected department and search term
  const filteredJobs = jobs.filter(j => {
    const matchesDept = selectedDept === 'All' || j.department === selectedDept
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col relative animate-in slide-in-from-bottom-4 duration-300 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-[#b88f3f]">
              Open Opportunities
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explore open roles at premier organizations curated by Aston Recruitment.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search controls */}
        <div className="p-6 bg-slate-900/50 border-b border-slate-800/60 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Search roles, skills, or locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-[#b88f3f] transition-colors"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-[#b88f3f] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading opportunities...</p>
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
              <p className="text-slate-400 text-sm font-medium">No open opportunities match your filters.</p>
              <p className="text-xs text-slate-500">Check back later or register to get notified of new matching positions.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-700 transition-all hover:bg-slate-950/80 group"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#b88f3f]/10 text-[#b88f3f] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {job.department}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      📍 {job.location}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      💼 {job.experience}
                    </span>
                    {job.salary && (
                      <span className="bg-slate-800/50 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        💰 {job.salary}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif group-hover:text-[#b88f3f] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {job.description}
                  </p>
                  {job.requirements && (
                    <div className="text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-400">Skills Stack: </span>
                      {job.requirements}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                  {isLoggedIn ? (
                    <div className="bg-[#b88f3f]/10 text-[#b88f3f] border border-[#b88f3f]/20 font-bold text-xs px-5 py-2.5 rounded-lg text-center shadow-xs">
                      Applied via Profile ✓
                    </div>
                  ) : (
                    <Link 
                      to="/candidate/register" 
                      onClick={onClose}
                      className="block bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-6 py-2.5 rounded-lg text-center tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      REGISTER TO APPLY →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewOpenRolesModal
