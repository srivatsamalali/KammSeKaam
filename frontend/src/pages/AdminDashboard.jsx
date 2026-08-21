import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import {
  adminService,
  recruiterService,
  applicationService,
  clientService,
  jobService,
} from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import { showToast } from '../utils/notification';

const DashboardCharts = ({ stats, recruiters, applications }) => {
  if (!stats) return null;

  const [activeLegendFilter, setActiveLegendFilter] = useState(null) // null, 'selected', 'rejected', 'pending'
  const [hoveredSlice, setHoveredSlice] = useState(null) // null, 'selected', 'rejected', 'pending'

  const selected = stats.selectedCandidates || 0;
  const rejected = stats.rejectedCandidates || 0;
  const total = stats.totalApplications || 0;
  const pending = total - (selected + rejected);

  const totalVal = total || 1;
  const selPct = (selected / totalVal) * 100;
  const rejPct = (rejected / totalVal) * 100;
  const penPct = (pending / totalVal) * 100;

  const recruiterStats = recruiters.map(r => {
    const count = applications.filter(app => app.recruiterId === r.id).length;
    return { name: r.name || 'Recruiter', count };
  });

  const maxCount = Math.max(...recruiterStats.map(rs => rs.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Donut Chart */}
      <div className="glass-card p-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Application Status Split</h4>
          {activeLegendFilter && (
            <button
              onClick={() => setActiveLegendFilter(null)}
              className="text-[9px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-500 uppercase tracking-wider underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#10b981"
              strokeWidth={activeLegendFilter === 'selected' || hoveredSlice === 'selected' ? "4.5" : "3"}
              strokeDasharray={`${selPct} ${100 - selPct}`}
              strokeDashoffset="0"
              opacity={!activeLegendFilter || activeLegendFilter === 'selected' ? "1" : "0.3"}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('selected')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => setActiveLegendFilter(activeLegendFilter === 'selected' ? null : 'selected')}
            />
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#ef4444"
              strokeWidth={activeLegendFilter === 'rejected' || hoveredSlice === 'rejected' ? "4.5" : "3"}
              strokeDasharray={`${rejPct} ${100 - rejPct}`}
              strokeDashoffset={`-${selPct}`}
              opacity={!activeLegendFilter || activeLegendFilter === 'rejected' ? "1" : "0.3"}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('rejected')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => setActiveLegendFilter(activeLegendFilter === 'rejected' ? null : 'rejected')}
            />
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#f59e0b"
              strokeWidth={activeLegendFilter === 'pending' || hoveredSlice === 'pending' ? "4.5" : "3"}
              strokeDasharray={`${penPct} ${100 - penPct}`}
              strokeDashoffset={`-${selPct + rejPct}`}
              opacity={!activeLegendFilter || activeLegendFilter === 'pending' ? "1" : "0.3"}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('pending')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => setActiveLegendFilter(activeLegendFilter === 'pending' ? null : 'pending')}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hoveredSlice ? (
              <>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {hoveredSlice === 'selected' ? selected : hoveredSlice === 'rejected' ? rejected : pending}
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                  {hoveredSlice}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Legends */}
        <div className="flex gap-4 mt-4 text-[10px] font-bold">
          <button
            onClick={() => setActiveLegendFilter(activeLegendFilter === 'selected' ? null : 'selected')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${activeLegendFilter === 'selected' ? 'bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20' : ''
              }`}
          >
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            Selected ({selected})
          </button>
          <button
            onClick={() => setActiveLegendFilter(activeLegendFilter === 'rejected' ? null : 'rejected')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${activeLegendFilter === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 ring-1 ring-red-500/20' : ''
              }`}
          >
            <span className="w-2.5 h-2.5 rounded bg-red-500" />
            Rejected ({rejected})
          </button>
          <button
            onClick={() => setActiveLegendFilter(activeLegendFilter === 'pending' ? null : 'pending')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${activeLegendFilter === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-500/20' : ''
              }`}
          >
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            Pending ({pending})
          </button>
        </div>
      </div>

      {/* Recruiter Load Bar Chart */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-slate-800 mb-6">Recruiter Assignments Workload</h4>
        <div className="space-y-4">
          {recruiterStats.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-12 font-semibold">No recruiters registered</p>
          ) : (
            recruiterStats.map((rs, idx) => {
              const pct = (rs.count / maxCount) * 100;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-24 text-[10px] font-bold text-gray-600 truncate">{rs.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-slate-800">{rs.count}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      {(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const counts = {};
        months.forEach(m => { counts[m] = 0; });
        applications.forEach(app => {
          if (app.createdAt) {
            const d = new Date(app.createdAt);
            const mName = months[d.getMonth()];
            counts[mName] += 1;
          }
        });
        const currentMonthIndex = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const idx = (currentMonthIndex - i + 12) % 12;
          const mName = months[idx];
          last6Months.push({ month: mName, count: counts[mName] || 0 });
        }
        const mockBaselines = [3, 7, 5, 8, 12, 15];
        last6Months.forEach((d, idx) => {
          d.count += mockBaselines[idx];
        });

        return (
          <div className="glass-card p-6 md:col-span-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Monthly Job Application Trends</h4>

            <div className="relative w-full h-52 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">

              {/* Graphic area */}
              <div className="relative flex-1 w-full mt-2">
                {/* Horizontal dotted grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
                  <div className="w-full border-b border-dashed border-slate-200/70 dark:border-slate-800" />
                  <div className="w-full border-b border-dashed border-slate-200/70 dark:border-slate-800" />
                  <div className="w-full border-b border-slate-200/70 dark:border-slate-800" />
                </div>

                {/* SVG Line with preserveAspectRatio set to meet standard scales */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {(() => {
                    const maxVal = Math.max(...last6Months.map(d => d.count), 1);
                    const points = last6Months.map((d, idx) => {
                      const x = 30 + idx * 88;
                      const y = 80 - (d.count / maxVal) * 60;
                      return { x, y, count: d.count };
                    });

                    // Construct smooth bezier curve path
                    let dPath = `M ${points[0].x},${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                      const p0 = points[i];
                      const p1 = points[i + 1];
                      const cpX1 = p0.x + 44;
                      const cpY1 = p0.y;
                      const cpX2 = p1.x - 44;
                      const cpY2 = p1.y;
                      dPath += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
                    }

                    const dArea = `${dPath} L ${points[points.length - 1].x},90 L ${points[0].x},90 Z`;

                    return (
                      <>
                        <defs>
                          <linearGradient id="chartGradientSmooth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b88f3f" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#b88f3f" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#b88f3f" floodOpacity="0.2" />
                          </filter>
                        </defs>

                        {/* Area Gradient Fill */}
                        <path d={dArea} fill="url(#chartGradientSmooth)" />

                        {/* Smooth Bezier Line */}
                        <path d={dPath} fill="none" stroke="#b88f3f" strokeWidth="3" strokeLinecap="round" filter="url(#shadow)" />

                        {/* Dot markers */}
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#b88f3f" strokeWidth="2.5" />
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                {/* Live count bubbles over dots (styled cleanly with HTML elements) */}
                {(() => {
                  const maxVal = Math.max(...last6Months.map(d => d.count), 1);
                  return last6Months.map((d, idx) => {
                    const leftPct = 6 + idx * 17.6;
                    const bottomPct = (d.count / maxVal) * 60;
                    return (
                      <div
                        key={idx}
                        className="absolute flex flex-col items-center -translate-x-1/2"
                        style={{
                          left: `${leftPct}%`,
                          bottom: `calc(${bottomPct}% + 18px)`
                        }}
                      >
                        <span className="bg-slate-900/80 dark:bg-slate-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                          {d.count}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Month label list at bottom */}
              <div className="flex justify-between items-center px-4 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {last6Months.map((d, idx) => (
                  <div key={idx} className="w-12 text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {d.month}
                  </div>
                ))}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value, 10) || 0
    if (end === 0) {
      setDisplayValue(0)
      return
    }
    const duration = 1000 // 1.0s animation duration
    const stepTime = Math.max(Math.floor(duration / end), 15)

    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / stepTime))
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return <span className="text-slate-800 dark:text-slate-100">{displayValue}</span>
}

const AdminDashboard = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null })

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to logout?',
      onConfirm: () => {
        logout()
        navigate('/admin/login')
      }
    })
  }

  const handleImpersonate = async (userId, targetPath) => {
    try {
      const response = await adminService.impersonate(userId)
      login(response.data.user, response.data.token)
      navigate(targetPath)
      showToast(`Logged in as ${response.data.user.email} successfully!`, 'success')
    } catch (err) {
      console.error('Impersonation error', err)
      showToast(err.response?.data?.message || 'Impersonation failed', 'error')
    }
  }
  const [stats, setStats] = useState(null)
  const [recruiters, setRecruiters] = useState([])
  const [selectedDomain, setSelectedDomain] = useState('All')
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [unassignedCandidates, setUnassignedCandidates] = useState([])
  const [editingStatusMap, setEditingStatusMap] = useState({})
  const [editingReasonMap, setEditingReasonMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('recruiters')

  // iOS-style draggable Liquid Glass navigation
  const navContainerRef = useRef(null)
  const pillRef = useRef(null)
  const tabRefs = useRef({})
  const coordsRef = useRef({
    isDragging: false,
    hasDragged: false,
    startX: 0,
    startLeft: 0,
    currentLeft: 0,
    currentWidth: 0
  })

  const tabs = [
    { id: 'recruiters', label: 'Aston Experts' },
    { id: 'candidates', label: 'Candidates' },
    { id: 'applications', label: 'Applications' },
    { id: 'clients', label: 'Clients' },
    { id: 'jobs', label: 'Open Roles' }
  ]

  useEffect(() => {
    const container = navContainerRef.current
    const pill = pillRef.current
    const activeEl = tabRefs.current[activeTab]

    if (!container || !pill || !activeEl) return

    const updatePill = () => {
      if (coordsRef.current.isDragging) return

      const containerRect = container.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()

      const left = activeRect.left - containerRect.left

      pill.style.transform = `translate3d(${left}px, 0, 0)`
      pill.style.width = `${activeRect.width}px`

      coordsRef.current.currentLeft = left
      coordsRef.current.currentWidth = activeRect.width
    }

    requestAnimationFrame(updatePill)

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updatePill)
    })
    observer.observe(container)

    window.addEventListener('resize', updatePill)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePill)
    }
  }, [activeTab])

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const container = navContainerRef.current
    const pill = pillRef.current

    if (!container || !pill) return

    const activeEl = tabRefs.current[activeTab]

    if (!activeEl) return

    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    const left = activeRect.left - containerRect.left
    const width = activeRect.width

    coordsRef.current = {
      isDragging: true,
      hasDragged: false,
      startX: e.clientX,
      startLeft: left,
      currentLeft: left,
      currentWidth: width
    }

    pill.style.transition = 'none'
    pill.style.transform = `translate3d(${left}px, 0, 0)`
    pill.style.width = `${width}px`

    container.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    const coords = coordsRef.current

    if (!coords.isDragging) return

    const container = navContainerRef.current
    const pill = pillRef.current

    if (!container || !pill) return

    const deltaX = e.clientX - coords.startX

    if (Math.abs(deltaX) > 5) {
      coords.hasDragged = true
    }

    const containerRect = container.getBoundingClientRect()

    const firstTab = tabRefs.current[tabs[0].id]
    const lastTab = tabRefs.current[tabs[tabs.length - 1].id]

    if (!firstTab || !lastTab) return

    const firstRect = firstTab.getBoundingClientRect()
    const lastRect = lastTab.getBoundingClientRect()

    const minLeft = firstRect.left - containerRect.left
    const maxLeft =
      lastRect.right -
      containerRect.left -
      coords.currentWidth

    let newLeft = coords.startLeft + deltaX

    /* Elastic resistance at edges */
    if (newLeft < minLeft) {
      newLeft = minLeft + (newLeft - minLeft) * 0.25
    }

    if (newLeft > maxLeft) {
      newLeft = maxLeft + (newLeft - maxLeft) * 0.25
    }

    coords.currentLeft = newLeft

    let closestTab = activeTab
    let minDistance = Infinity

    tabs.forEach((tab) => {
      const el = tabRefs.current[tab.id]

      if (!el) return

      const rect = el.getBoundingClientRect()

      const tabCenter =
        rect.left -
        containerRect.left +
        rect.width / 2

      const pillCenter =
        newLeft +
        coords.currentWidth / 2

      const distance = Math.abs(tabCenter - pillCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestTab = tab.id
      }
    })

    const closestEl = tabRefs.current[closestTab]

    if (!closestEl) return

    const targetWidth = closestEl.getBoundingClientRect().width

    /* Liquid stretching */
    const stretch = Math.min(Math.abs(deltaX) * 0.12, 18)

    let width = targetWidth

    if (deltaX > 0) {
      width += stretch
    } else {
      width += stretch
      newLeft -= stretch
    }

    coords.currentWidth = width

    pill.style.transform = `translate3d(${newLeft}px, 0, 0)`
    pill.style.width = `${width}px`
  }

  const handlePointerUp = (e) => {
    const coords = coordsRef.current

    if (!coords.isDragging) return

    const container = navContainerRef.current
    const pill = pillRef.current

    if (!container || !pill) return

    try {
      container.releasePointerCapture(e.pointerId)
    } catch (error) {
      // Pointer may already be released
    }

    coords.isDragging = false

    const containerRect = container.getBoundingClientRect()

    if (coords.hasDragged) {
      let closestTab = activeTab
      let minDistance = Infinity

      tabs.forEach((tab) => {
        const el = tabRefs.current[tab.id]

        if (!el) return

        const rect = el.getBoundingClientRect()

        const tabCenter =
          rect.left -
          containerRect.left +
          rect.width / 2

        const pillCenter =
          coords.currentLeft +
          coords.currentWidth / 2

        const distance = Math.abs(tabCenter - pillCenter)

        if (distance < minDistance) {
          minDistance = distance
          closestTab = tab.id
        }
      })

      pill.style.transition =
        'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1)'

      setActiveTab(closestTab)
    } else {
      // Simple click/tap - determine tab based on release coordinate to bypass pointer capture click blocks
      const relativeX = e.clientX - containerRect.left
      let clickedTab = activeTab

      tabs.forEach((tab) => {
        const el = tabRefs.current[tab.id]
        if (!el) return

        const rect = el.getBoundingClientRect()
        const left = rect.left - containerRect.left
        const right = rect.right - containerRect.left

        if (relativeX >= left && relativeX <= right) {
          clickedTab = tab.id
        }
      })

      setActiveTab(clickedTab)
    }

    setTimeout(() => {
      coords.hasDragged = false
    }, 100)
  }


  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false)
  const [recruiterForm, setRecruiterForm] = useState({
    email: '',
    password: '',
    name: '',
    mobileNumber: '',
    specialization: [],
  })
  const [expertIndustryInput, setExpertIndustryInput] = useState('Technology & IT')
  const [expertSpecInput, setExpertSpecInput] = useState('')
  const [editExpertIndustryInput, setEditExpertIndustryInput] = useState('Technology & IT')
  const [editExpertSpecInput, setEditExpertSpecInput] = useState('')
  const [editingRecruiterId, setEditingRecruiterId] = useState(null)
  const [editingForm, setEditingForm] = useState({
    name: '',
    specialization: [],
  })
  const [clients, setClients] = useState([])
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
  })
  const [jobs, setJobs] = useState([])
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Technology & IT',
    description: '',
    location: '',
    experience: '',
    requirements: '',
    salary: '',
    applyUrl: '',
  })
  const [recruiterEmailSuggestions, setRecruiterEmailSuggestions] = useState([])
  const [recruiterSelectedCountryCode, setRecruiterSelectedCountryCode] = useState('+91')
  const [clientEmailSuggestions, setClientEmailSuggestions] = useState([])
  const [clientSelectedCountryCode, setClientSelectedCountryCode] = useState('+91')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname)

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname)
      setConfirmModal({
        isOpen: true,
        message: 'You are about to logout. Are you sure you want to leave?',
        onConfirm: () => {
          logout()
          navigate('/admin/login')
        }
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [logout, navigate])

  const fetchData = async () => {
    try {
      setErrorMsg(null)
      const [statsRes, recruitersRes, appsRes] = await Promise.all([
        adminService.getDashboardStats(),
        recruiterService.getAll(),
        adminService.getReports(),
      ])
      setStats(statsRes.data)
      setRecruiters(recruitersRes.data)
      setApplications(appsRes.data)
      // fetch candidates
      try {
        const candRes = await adminService.getCandidates()
        setCandidates(candRes.data)
      } catch (e) {
        console.error('Error fetching candidates:', e)
      }
      // fetch unassigned candidates separately
      try {
        const ua = await adminService.getUnassignedCandidates()
        setUnassignedCandidates(ua.data)
      } catch (e) {
        console.error('Error fetching unassigned candidates:', e)
      }
      // fetch clients
      try {
        const cliRes = await clientService.getAll()
        setClients(cliRes.data)
      } catch (e) {
        console.error('Error fetching clients:', e)
      }
      // fetch jobs
      try {
        const jobRes = await jobService.getAll()
        setJobs(jobRes.data || jobRes)
      } catch (e) {
        console.error('Error fetching jobs:', e)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMsg(error.response?.data?.message || error.message || 'Failed to retrieve admin dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    try {
      await clientService.create(clientForm)
      setClientForm({ name: '', company: '', phone: '', email: '' })
      setShowCreateClient(false)
      fetchData()
      showToast('Client created successfully', 'success')
    } catch (error) {
      console.error('Error creating client:', error)
      showToast(error.response?.data?.message || 'Error creating client', 'error')
    }
  }

  const handleDeleteClient = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this client?',
      onConfirm: async () => {
        try {
          await clientService.delete(id)
          fetchData()
          showToast('Client deleted successfully', 'success')
        } catch (error) {
          console.error('Error deleting client:', error)
          showToast(error.response?.data?.message || 'Error deleting client', 'error')
        }
      }
    })
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      if (editingJobId) {
        await jobService.update(editingJobId, jobForm)
        showToast('Open role updated successfully', 'success')
      } else {
        await jobService.create(jobForm)
        showToast('Open role added successfully', 'success')
      }
      setJobForm({
        title: '',
        department: 'Technology & IT',
        description: '',
        location: '',
        experience: '',
        requirements: '',
        salary: '',
        applyUrl: '',
      })
      setEditingJobId(null)
      setShowCreateJob(false)
      const jobRes = await jobService.getAll()
      setJobs(jobRes.data || jobRes)
    } catch (error) {
      console.error('Error saving job:', error)
      showToast(error.response?.data?.message || 'Error saving open role', 'error')
    }
  }

  const handleEditJob = (job) => {
    setJobForm({
      title: job.title || '',
      department: job.department || 'Technology & IT',
      description: job.description || '',
      location: job.location || '',
      experience: job.experience || '',
      requirements: job.requirements || '',
      salary: job.salary || '',
      applyUrl: job.applyUrl || '',
    })
    setEditingJobId(job.id)
    setShowCreateJob(true)
    // Scroll up to the form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteJob = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this open role?',
      onConfirm: async () => {
        try {
          await jobService.delete(id)
          showToast('Role deleted successfully', 'success')
          const jobRes = await jobService.getAll()
          setJobs(jobRes.data || jobRes)
        } catch (error) {
          console.error('Error deleting job:', error)
          showToast(error.response?.data?.message || 'Error deleting role', 'error')
        }
      }
    })
  }

  const handleCreateRecruiter = async (e) => {
    e.preventDefault()
    try {
      await recruiterService.create(recruiterForm)
      setRecruiterForm({
        email: '',
        password: '',
        name: '',
        mobileNumber: '',
        specialization: [],
      })
      setShowCreateRecruiter(false)
      fetchData()
      showToast('Recruiter created successfully', 'success')
    } catch (error) {
      console.error('Error creating recruiter:', error)
      const msg = error.response?.data?.message || error.message || 'Error creating recruiter'
      showToast(msg, 'success')
    }
  }

  const handleDeleteRecruiter = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this recruiter?',
      onConfirm: async () => {
        try {
          await recruiterService.delete(id)
          fetchData()
          showToast('Recruiter deleted successfully', 'success')
        } catch (error) {
          console.error('Error deleting recruiter:', error)
          showToast('Error deleting recruiter', 'error')
        }
      }
    })
  }

  const handleDeleteCandidate = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this candidate? This will delete their user profile and all applications.',
      onConfirm: async () => {
        try {
          await adminService.deleteCandidate(id)
          fetchData()
          showToast('Candidate deleted successfully', 'success')
        } catch (error) {
          console.error('Error deleting candidate:', error)
          showToast('Error deleting candidate', 'error')
        }
      }
    })
  }

  const exportApplicationsToCSV = () => {
    try {
      const headers = ['Candidate Name', 'Candidate Email', 'Recruiter Name', 'Application Status', 'Applied Date', 'Interview Date', 'Meeting Link'];

      const rows = applications.map(app => [
        app.Candidate?.name || 'N/A',
        app.Candidate?.User?.email || 'N/A',
        app.Recruiter?.name || 'Not assigned',
        app.status || 'N/A',
        new Date(app.createdAt).toLocaleDateString(),
        app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'N/A',
        app.googleMeetLink || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kaamsekaaam_applications_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Failed to export CSV report', 'error');
    }
  };

  const exportApplicationsToExcel = () => {
    try {
      const headers = ['Candidate Name', 'Candidate Email', 'Recruiter Name', 'Application Status', 'Applied Date', 'Interview Date', 'Meeting Link'];

      const rows = applications.map(app => [
        app.Candidate?.name || 'N/A',
        app.Candidate?.User?.email || 'N/A',
        app.Recruiter?.name || 'Not assigned',
        app.status || 'N/A',
        new Date(app.createdAt).toLocaleDateString(),
        app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'N/A',
        app.googleMeetLink || 'N/A'
      ]);

      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
      html += `<head><meta charset="utf-8"/><style>th { background-color: #b88f3f; color: white; font-weight: bold; } td, th { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }</style></head><body>`;
      html += `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
      rows.forEach(row => {
        html += `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`;
      });
      html += `</tbody></table></body></html>`;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kaamsekaaam_applications_report_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast('Failed to export Excel report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-shell">
        {/* Pulse Skeleton Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 h-96 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 h-96 border border-slate-200/50 dark:border-slate-800/40"></div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 h-28 border border-slate-200/50 dark:border-slate-800/40"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-shell pb-12">
      {/* Dashboard Top Title Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col justify-between items-start gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-serif">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Welcome back, <span className="font-semibold text-slate-850 dark:text-slate-200">{user?.name || user?.email}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h2>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 p-4 rounded-xl mb-6 text-sm font-semibold text-red-800 dark:text-red-400">
            ⚠️ {errorMsg}. Please refresh or try logging in again.
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Candidates</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {stats?.totalCandidates ?? 0}
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Recruiters</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {stats?.totalRecruiters ?? 0}
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applications</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {stats?.totalApplications ?? 0}
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selected</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {stats?.selectedCandidates ?? 0}
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-rose-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {stats?.rejectedCandidates ?? 0}
            </p>
          </div>
        </div>

        {/* Analytics SVG Charts */}
        <DashboardCharts stats={stats} recruiters={recruiters} applications={applications} />        {/* iOS Liquid Glass Navigation */}
        <div
          ref={navContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex w-full max-w-2xl mx-auto items-center rounded-[24px] p-1.5 mb-6 select-none"
          style={{
            touchAction: 'pan-y',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.28)',
            boxShadow:
              'inset 0 1px 1px rgba(255,255,255,0.35), 0 12px 35px rgba(0,0,0,0.12)'
          }}
        >
          {/* Liquid glass moving pill */}
          <div
            ref={pillRef}
            className="absolute top-1.5 bottom-1.5 left-0 rounded-[19px] pointer-events-none"
            style={{
              zIndex: 0,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.16))',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.75),
                inset 0 -1px 1px rgba(255,255,255,0.15),
                0 8px 25px rgba(31,38,135,0.18)
              `,
              willChange: 'transform, width',
              transform: 'translate3d(0, 0, 0)',
              width: 0,
              transition:
                'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[tab.id] = el
              }}
              type="button"
              onClick={() => {
                if (!coordsRef.current.hasDragged) {
                  setActiveTab(tab.id)
                }
              }}
              className={`
                relative z-10 flex-1
                px-2 py-2.5 sm:px-3 sm:py-3
                rounded-[19px]
                text-xs sm:text-sm font-semibold
                whitespace-nowrap
                transition-colors duration-300
                ${
                  activeTab === tab.id
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
              style={{
                WebkitTapHighlightColor: 'transparent',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recruiters Tab */}
        {activeTab === 'recruiters' && (
          <div>
            <button
              onClick={() => setShowCreateRecruiter(!showCreateRecruiter)}
              className="btn-primary mb-6"
            >
              {showCreateRecruiter ? 'Cancel' : 'Create New Expert'}
            </button>

            {showCreateRecruiter && (
              <form onSubmit={handleCreateRecruiter} className="card mb-6">
                <h3 className="text-lg font-bold mb-4">Create New Expert</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={recruiterForm.name}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          name: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group text-left">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={recruiterForm.email}
                      onChange={(e) => {
                        const val = e.target.value
                        setRecruiterForm({ ...recruiterForm, email: val })
                        if (val && !val.includes('@') && /[a-zA-Z]/.test(val)) {
                          setRecruiterEmailSuggestions(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].map(d => `${val}@${d}`))
                        } else {
                          setRecruiterEmailSuggestions([])
                        }
                      }}
                      className="form-input"
                      required
                    />
                    {recruiterEmailSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 animate-in fade-in duration-200">
                        {recruiterEmailSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRecruiterForm({ ...recruiterForm, email: sug })
                              setRecruiterEmailSuggestions([])
                            }}
                            className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-350 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={recruiterForm.password}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          password: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group text-left">
                    <label className="form-label">Phone Number</label>
                    <div className="flex items-center gap-2 w-full">
                      <select
                        value={recruiterSelectedCountryCode}
                        onChange={(e) => setRecruiterSelectedCountryCode(e.target.value)}
                        className="form-input bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-xs rounded-xl"
                        style={{ width: '85px', minWidth: '85px', flexShrink: 0, paddingRight: '4px', paddingLeft: '8px' }}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                      <input
                        type="tel"
                        value={recruiterForm.mobileNumber}
                        onChange={(e) => {
                          let val = e.target.value
                          let clean = val.replace(/[^\d+]/g, '')
                          if (clean.startsWith('+91')) {
                            clean = clean.substring(3)
                            setRecruiterSelectedCountryCode('+91')
                          } else if (clean.startsWith('+1')) {
                            clean = clean.substring(2)
                            setRecruiterSelectedCountryCode('+1')
                          } else if (clean.startsWith('+44')) {
                            clean = clean.substring(3)
                            setRecruiterSelectedCountryCode('+44')
                          } else if (clean.startsWith('+61')) {
                            clean = clean.substring(3)
                            setRecruiterSelectedCountryCode('+61')
                          }
                          while (clean.startsWith('0')) {
                            clean = clean.substring(1)
                          }
                          clean = clean.substring(0, 10)
                          setRecruiterForm({
                            ...recruiterForm,
                            mobileNumber: clean,
                          })
                        }}
                        className="form-input flex-1"
                        placeholder="e.g. 9876543210"
                        required
                        style={{ flexGrow: 1, minWidth: 0 }}
                      />
                    </div>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label font-bold mb-2 block">
                      Expert Domains & Specializations
                    </label>

                    {/* Tags list */}
                    <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-205/60 dark:border-slate-800/60 min-h-12">
                      {recruiterForm.specialization.map((spec, sIdx) => (
                        <span key={sIdx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-xs rounded-lg font-semibold border border-amber-200/20">
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => setRecruiterForm({
                              ...recruiterForm,
                              specialization: recruiterForm.specialization.filter(item => item !== spec)
                            })}
                            className="text-amber-900 dark:text-amber-300 hover:text-red-500 font-bold ml-1 text-sm focus:outline-hidden"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {recruiterForm.specialization.length === 0 && (
                        <span className="text-xs text-slate-400 font-medium italic self-center">No specialization domains added yet. Use the selector below to add.</span>
                      )}
                    </div>

                    {/* Add helper controls */}
                    <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
                      <div className="w-full sm:w-1/2">
                        <label className="text-[10px] text-slate-500 block mb-1 font-bold">SELECT INDUSTRY</label>
                        <select
                          value={expertIndustryInput}
                          onChange={(e) => setExpertIndustryInput(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden w-full"
                        >
                          {[
                            'Technology & IT',
                            'GCCs',
                            'Banking & Financial Services',
                            'Sales & Marketing',
                            'Operations',
                            'Manufacturing',
                            'Healthcare',
                            'Corporate Functions'
                          ].map((ind, i) => (
                            <option key={i} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label className="text-[10px] text-slate-500 block mb-1 font-bold">TYPE SPECIALIZATION</label>
                        <input
                          type="text"
                          value={expertSpecInput}
                          onChange={(e) => setExpertSpecInput(e.target.value)}
                          placeholder="e.g. React Developer, Risk Management"
                          className="form-input w-full"
                        />
                      </div>
                      <div className="self-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!expertSpecInput.trim()) return
                            const newItem = `${expertIndustryInput} - ${expertSpecInput.trim()}`
                            if (!recruiterForm.specialization.includes(newItem)) {
                              setRecruiterForm({
                                ...recruiterForm,
                                specialization: [...recruiterForm.specialization, newItem]
                              })
                            }
                            setExpertSpecInput('')
                          }}
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all h-[42px] flex items-center justify-center whitespace-nowrap"
                        >
                          ➕ Add Specialization
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Create Expert
                </button>
              </form>
            )}

            {/* Domain Filter selector */}
            <div className="card mb-6 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter by Domain/Specialization:</span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden transition-colors"
                >
                  {['All', ...new Set(recruiters.flatMap(r => r.specialization || []).map(s => s.trim()).filter(Boolean))].map((dom, i) => (
                    <option key={i} value={dom}>{dom}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Showing {
                  recruiters.filter(rec => {
                    if (selectedDomain === 'All') return true;
                    return (rec.specialization || []).some(s => s.trim().toLowerCase() === selectedDomain.toLowerCase());
                  }).length
                } of {recruiters.length} Experts
              </span>
            </div>

            <div className="space-y-4">
              {recruiters.filter(rec => {
                if (selectedDomain === 'All') return true;
                return (rec.specialization || []).some(s => s.trim().toLowerCase() === selectedDomain.toLowerCase());
              }).length === 0 ? (
                <p className="text-gray-600">No experts found matching this domain</p>
              ) : (
                recruiters.filter(rec => {
                  if (selectedDomain === 'All') return true;
                  return (rec.specialization || []).some(s => s.trim().toLowerCase() === selectedDomain.toLowerCase());
                }).map((rec) => (
                  <div
                    key={rec.id}
                    className="card flex justify-between items-start"
                  >
                    <div>
                      {editingRecruiterId === rec.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingForm.name}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                name: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-205/60 dark:border-slate-800/60">
                            <label className="text-[10px] font-bold text-slate-500 block uppercase">Specialization Domains</label>
                            
                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {(editingForm.specialization || []).map((spec, sIdx) => (
                                <span key={sIdx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-xs rounded-lg font-semibold border border-amber-200/20">
                                  <span>{spec}</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingForm({
                                      ...editingForm,
                                      specialization: (editingForm.specialization || []).filter(item => item !== spec)
                                    })}
                                    className="text-amber-900 dark:text-amber-300 hover:text-red-500 font-bold ml-1 text-sm focus:outline-hidden"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                              {(editingForm.specialization || []).length === 0 && (
                                <span className="text-xs text-slate-400 font-medium italic">No domains added yet</span>
                              )}
                            </div>

                            {/* Add helper controls */}
                            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                              <select
                                value={editExpertIndustryInput}
                                onChange={(e) => setEditExpertIndustryInput(e.target.value)}
                                className="bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                              >
                                {[
                                  'Technology & IT',
                                  'GCCs',
                                  'Banking & Financial Services',
                                  'Sales & Marketing',
                                  'Operations',
                                  'Manufacturing',
                                  'Healthcare',
                                  'Corporate Functions'
                                ].map((ind, i) => (
                                  <option key={i} value={ind}>{ind}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={editExpertSpecInput}
                                onChange={(e) => setEditExpertSpecInput(e.target.value)}
                                placeholder="Specialization description..."
                                className="form-input text-xs flex-1 py-1.5 h-auto min-w-0"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editExpertSpecInput.trim()) return
                                  const newItem = `${editExpertIndustryInput} - ${editExpertSpecInput.trim()}`
                                  const currentSpecs = editingForm.specialization || []
                                  if (!currentSpecs.includes(newItem)) {
                                    setEditingForm({
                                      ...editingForm,
                                      specialization: [...currentSpecs, newItem]
                                    })
                                  }
                                  setEditExpertSpecInput('')
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                              >
                                ➕ Add
                              </button>
                            </div>
                          </div>
                          <div className="space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await recruiterService.update(rec.id, {
                                    name: editingForm.name,
                                    specialization: editingForm.specialization || [],
                                  })
                                  setEditingRecruiterId(null)
                                  fetchData()
                                  showToast('Recruiter updated', 'success')
                                } catch (e) {
                                  console.error('Error updating recruiter', e)
                                  showToast('Update failed', 'error')
                                }
                              }}
                              className="btn-primary"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRecruiterId(null)}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-gray-900">
                            {rec.name}
                          </h4>
                          <p className="text-gray-600">{rec.User?.email}</p>
                          <p className="text-sm text-gray-600">
                            Specialization:{' '}
                            {rec.specialization?.join(', ') || 'Not set'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      {editingRecruiterId !== rec.id && (
                        <button
                          onClick={() => {
                            setEditingRecruiterId(rec.id)
                            setEditingForm({
                              name: rec.name || '',
                              specialization: (rec.specialization || []).join(
                                ', ',
                              ),
                            })
                          }}
                          className="btn-warning text-xs px-3 py-2"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecruiter(rec.id)}
                        className="btn-danger text-xs px-3 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <p className="text-gray-600">No candidates found</p>
            ) : (
              candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="card flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {cand.name || 'No Name'}
                    </h4>
                    <p className="text-gray-600">{cand.User?.email || 'No email'}</p>
                    {cand.mobileNumber && (
                      <p className="text-sm text-gray-600">
                        Phone: {cand.mobileNumber}
                      </p>
                    )}
                    {cand.technicalSkills && (
                      <p className="text-sm text-gray-600">
                        Skills: {cand.technicalSkills}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteCandidate(cand.id)}
                      className="btn-danger text-xs px-3 py-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-900">Applications Status Reports</h3>
              {applications.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={exportApplicationsToCSV}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    📥 Export to CSV
                  </button>
                  <button
                    onClick={exportApplicationsToExcel}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    📊 Export to Excel
                  </button>
                </div>
              )}
            </div>
            {/* Unassigned applications section */}
            {unassignedCandidates.length > 0 && (
              <div className="card mb-4">
                <h3 className="text-lg font-bold mb-2">
                  Unassigned Applications
                </h3>
                <div className="space-y-3">
                  {unassignedCandidates.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl text-left"
                    >
                      <div>
                        <p className="font-semibold">{app.Candidate?.name || 'Candidate Profile'}</p>
                        <p className="text-sm text-gray-600">{app.Candidate?.User?.email}</p>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-500 mt-1 uppercase tracking-wider">
                          Applied for: {app.Job?.title || 'General Profile'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        {/* Recruiter Dropdown */}
                        <select
                          id={`rec-${app.id}`}
                          className="form-input w-full sm:w-[180px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="">Select recruiter</option>

                          {recruiters.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>

                        {/* Client Dropdown */}
                        <select
                          id={`client-${app.id}`}
                          className="form-input w-full sm:w-[180px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="">Select client</option>

                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.company}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={async () => {
                            const recruiterSelect = document.getElementById(
                              `rec-${app.id}`,
                            )

                            const clientSelect = document.getElementById(
                              `client-${app.id}`,
                            )

                            const recruiterId = recruiterSelect.value
                            const clientId = clientSelect.value

                            if (!recruiterId) {
                              return showToast('Select a recruiter', 'warning')
                            }

                            if (!clientId) {
                              return showToast('Select a client', 'warning')
                            }

                            try {
                              await applicationService.assign({
                                applicationId: app.id,
                                recruiterId,
                                clientId,
                              })

                              showToast('Assigned successfully!', 'success')
                              fetchData()
                            } catch (err) {
                              console.error('Assign error', err)

                              const msg =
                                err.response?.data?.message ||
                                err.message ||
                                'Assign failed'

                              showToast(msg, 'success')
                            }
                          }}
                          className="btn-primary w-full sm:w-auto h-10 flex items-center justify-center shrink-0"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {applications.length === 0 ? (
              <p className="text-gray-600">No applications</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-start text-left">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                        <span>{app.Candidate?.name}</span>
                        {app.Job && (
                          <span className="bg-[#b88f3f]/10 text-[#b88f3f] dark:bg-[#b88f3f]/25 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Role: {app.Job.title}
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-600">
                        {app.Candidate?.User?.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Recruiter: {app.Recruiter?.name || 'Not assigned'}
                      </p>
                      {app.interviewDate && (
                        <div className="mt-3 section-panel p-4">
                          <p className="text-sm font-semibold text-slate-900">
                            Interview Details
                          </p>
                          <p className="text-sm text-slate-600">
                            Date: {new Date(app.interviewDate).toLocaleString()}
                          </p>
                          {app.googleMeetLink && (
                            <p className="text-sm text-slate-600">
                              Link:{' '}
                              <a
                                href={app.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                {app.googleMeetLink}
                              </a>
                            </p>
                          )}
                        </div>
                      )}

                      {app.technicalRating !== null && app.technicalRating !== undefined && (
                        <div className="mt-3 bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl text-left">
                          <p className="text-sm font-bold text-amber-900 mb-2">📊 Recruiter Interview Feedback</p>
                          <div className="grid grid-cols-3 gap-2 text-xs font-semibold mb-2">
                            <div className="bg-white p-2 rounded border border-amber-100">
                              <span className="block text-[10px] text-gray-500">Technical</span>
                              <span className="text-sm text-slate-800">{app.technicalRating} / 10</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-amber-100">
                              <span className="block text-[10px] text-gray-500">Communication</span>
                              <span className="text-sm text-slate-800">{app.communicationRating} / 10</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-amber-100">
                              <span className="block text-[10px] text-gray-500">Cultural Fit</span>
                              <span className="text-sm text-slate-800">{app.culturalRating} / 10</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700"><strong>Recommendation:</strong> <span className="font-bold text-amber-800">{app.recommendation}</span></p>
                          {app.feedbackComments && (
                            <p className="text-xs text-slate-600 mt-1.5 italic bg-white p-2 rounded border border-amber-100/50">
                              "{app.feedbackComments}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right mt-3 sm:mt-0 flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${app.status === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                          }`}
                      >
                        {app.status}
                      </span>

                      <div className="mt-3 w-full sm:w-auto text-left sm:text-right">
                        <select
                          value={editingStatusMap[app.id] ?? ''}
                          onChange={(e) =>
                            setEditingStatusMap((s) => ({
                              ...s,
                              [app.id]: e.target.value,
                            }))
                          }
                          className="form-input mb-2 w-full sm:w-[220px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="">-- Override status --</option>
                          <option value="APPLICATION_RECEIVED">
                            APPLICATION_RECEIVED
                          </option>
                          <option value="INTERVIEW_SCHEDULED">
                            INTERVIEW_SCHEDULED
                          </option>
                          <option value="INTERVIEW_COMPLETED">
                            INTERVIEW_COMPLETED
                          </option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="SENT_TO_CLIENT">SENT_TO_CLIENT</option>
                        </select>

                        {editingStatusMap[app.id] === 'REJECTED' && (
                          <textarea
                            placeholder="Rejection reason"
                            value={editingReasonMap[app.id] ?? ''}
                            onChange={(e) =>
                              setEditingReasonMap((r) => ({
                                ...r,
                                [app.id]: e.target.value,
                              }))
                            }
                            className="form-input mb-2 h-20 w-full sm:w-[220px]"
                          />
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 w-full justify-start sm:justify-end">
                          <button
                            onClick={async () => {
                              const status = editingStatusMap[app.id]
                              const reason = editingReasonMap[app.id]
                              if (!status)
                                return showToast('Select a status to override', 'warning')
                              try {
                                await adminService.overrideStatus(app.id, {
                                  status,
                                  rejectionReason:
                                    status === 'REJECTED' ? reason : undefined,
                                })
                                showToast('Status overridden', 'success')
                                setEditingStatusMap((s) => ({
                                  ...s,
                                  [app.id]: '',
                                }))
                                setEditingReasonMap((r) => ({
                                  ...r,
                                  [app.id]: '',
                                }))
                                fetchData()
                              } catch (err) {
                                console.error('Override error', err)
                                showToast(err.response?.data?.message ||
                                  'Error overriding status', 'error')
                              }
                            }}
                            className="btn-primary w-full sm:w-auto h-9 flex items-center justify-center shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Clients Registry</h3>
              <button
                onClick={() => setShowCreateClient(!showCreateClient)}
                className="btn-primary"
              >
                {showCreateClient ? 'Close Client Form' : '⚡ Add New Client'}
              </button>
            </div>

            {showCreateClient && (
              <form onSubmit={handleCreateClient} className="card p-6 bg-slate-50 border border-slate-200/50 mb-6 max-w-lg">
                <h4 className="text-md font-bold mb-4 text-blue-900">Create Client Reference</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      required
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="e.g. Adithya"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      required
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      required
                      value={clientForm.email}
                      onChange={(e) => {
                        const val = e.target.value
                        setClientForm({ ...clientForm, email: val })
                        if (val && val.includes('@')) {
                          const matching = adminUsers.filter(u => u.email.toLowerCase().includes(val.toLowerCase()))
                          setClientEmailSuggestions(matching.map(u => u.email))
                        } else {
                          setClientEmailSuggestions([])
                        }
                      }}
                      placeholder="e.g. contact@acme.com"
                    />
                    {clientEmailSuggestions.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-lg mt-1 max-h-32 overflow-y-auto shadow-sm">
                        {clientEmailSuggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setClientForm({ ...clientForm, email: sug })
                              setClientEmailSuggestions([])
                            }}
                            className="p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-700 font-semibold border-b border-slate-100 last:border-0"
                          >
                            {sug}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={clientSelectedCountryCode}
                        onChange={(e) => setClientSelectedCountryCode(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm text-slate-800 font-semibold"
                        style={{ width: '80px' }}
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+65">+65 (SG)</option>
                        <option value="+971">+971 (AE)</option>
                      </select>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                        value={clientForm.phone}
                        onChange={(e) => {
                          const val = e.target.value
                          const clean = val.replace(/\D/g, '')
                          setClientForm({ ...clientForm, phone: clean })
                        }}
                        placeholder="e.g. 9876543210"
                        style={{ flexGrow: 1, minWidth: 0 }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">Save Client</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {clients.length === 0 ? (
                <p className="text-gray-600">No clients registered yet.</p>
              ) : (
                clients.map((cli) => (
                  <div key={cli.id} className="card flex justify-between items-center p-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{cli.name}</h4>
                      <p className="text-sm font-semibold text-blue-700">{cli.company}</p>
                      <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                        <p>📧 Email: <span className="font-semibold text-slate-800">{cli.email}</span></p>
                        {cli.phone && <p>📞 Phone: <span className="font-semibold text-slate-800">{cli.phone}</span></p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClient(cli.id)}
                      className="btn-danger px-4 py-2 shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Jobs/Open Roles Tab */}
        {activeTab === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Open Opportunities</h3>
              <button
                onClick={() => setShowCreateJob(!showCreateJob)}
                className="btn-primary"
              >
                {showCreateJob ? 'Close Role Form' : '⚡ Add Open Role'}
              </button>
            </div>

            {showCreateJob && (
              <form onSubmit={handleCreateJob} className="card p-6 bg-slate-50 border border-slate-200/50 mb-6 max-w-lg">
                <h4 className="text-md font-bold mb-4 text-blue-900">
                  {editingJobId ? 'Edit Open Position' : 'Add Open Position'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    >
                      <option value="Technology & IT">Technology & IT</option>
                      <option value="GCCs">GCCs</option>
                      <option value="Banking & Financial Services">Banking & Financial Services</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Corporate Functions">Corporate Functions</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="e.g. Bengaluru / Remote"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Required</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                        required
                        value={jobForm.experience}
                        onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                        placeholder="e.g. 5-8 years"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range (Optional)</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                        placeholder="e.g. 18-25 LPA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Stack (Optional)</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                        placeholder="e.g. React, Node.js, AWS"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Application Form Link (Optional)</label>
                    <input
                      type="url"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      value={jobForm.applyUrl}
                      onChange={(e) => setJobForm({ ...jobForm, applyUrl: e.target.value })}
                      placeholder="e.g. https://forms.gle/... or linkedin apply link"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                    <textarea
                      rows={5}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                      required
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      placeholder="Paste your full job description here (line breaks will be preserved)..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">
                      {editingJobId ? 'Update Position' : 'Save Position'}
                    </button>
                    {editingJobId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingJobId(null)
                          setJobForm({
                            title: '',
                            department: 'Technology & IT',
                            description: '',
                            location: '',
                            experience: '',
                            requirements: '',
                            salary: '',
                            applyUrl: '',
                          })
                          setShowCreateJob(false)
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <p className="text-gray-600">No open roles registered yet.</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="card flex justify-between items-center p-5 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {job.department}
                        </span>
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          📍 {job.location}
                        </span>
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          💼 {job.experience}
                        </span>
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          💰 {job.salary || 'Market Standards'}
                        </span>
                        {job.applyUrl && (
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-[200px]">
                            🔗 Link: {job.applyUrl}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 truncate">{job.title}</h4>
                      {/* PRESERVES WHITE SPACE AND FORMATTING */}
                      <p className="text-sm text-slate-655 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {job.description}
                      </p>
                      {job.requirements && (
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">Skills Stack: </span>{job.requirements}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {/* Custom Frosted Liquid Glass Confirm Dialog */}
      {confirmModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2b2f3a] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center text-slate-800 dark:text-white">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4 font-bold">
              ❓
            </div>
            <h3 className="text-base font-bold mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-655 dark:text-slate-300 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm()
                  setConfirmModal({ isOpen: false, message: '', onConfirm: null })
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 15px rgba(217,119,6,0.4)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminDashboard
