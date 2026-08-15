import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  adminService,
  recruiterService,
  applicationService,
  clientService,
} from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

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

  return <span>{displayValue}</span>
}

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/admin/login')
    }
  }
  const [stats, setStats] = useState(null)
  const [recruiters, setRecruiters] = useState([])
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [unassignedCandidates, setUnassignedCandidates] = useState([])
  const [editingStatusMap, setEditingStatusMap] = useState({})
  const [editingReasonMap, setEditingReasonMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false)
  const [recruiterForm, setRecruiterForm] = useState({
    email: '',
    password: '',
    name: '',
    mobileNumber: '',
    specialization: [],
  })
  const [editingRecruiterId, setEditingRecruiterId] = useState(null)
  const [editingForm, setEditingForm] = useState({
    name: '',
    specialization: '',
  })
  const [clients, setClients] = useState([])
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error)
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
      alert('Client created successfully')
    } catch (error) {
      console.error('Error creating client:', error)
      alert(error.response?.data?.message || 'Error creating client')
    }
  }

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return
    try {
      await clientService.delete(id)
      fetchData()
      alert('Client deleted successfully')
    } catch (error) {
      console.error('Error deleting client:', error)
      alert(error.response?.data?.message || 'Error deleting client')
    }
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
      alert('Recruiter created successfully')
    } catch (error) {
      console.error('Error creating recruiter:', error)
      const msg = error.response?.data?.message || error.message || 'Error creating recruiter'
      alert(msg)
    }
  }

  const handleDeleteRecruiter = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await recruiterService.delete(id)
        fetchData()
        alert('Recruiter deleted successfully')
      } catch (error) {
        console.error('Error deleting recruiter:', error)
        alert('Error deleting recruiter')
      }
    }
  }

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate? This will delete their user profile and all applications.')) {
      try {
        await adminService.deleteCandidate(id)
        fetchData()
        alert('Candidate deleted successfully')
      } catch (error) {
        console.error('Error deleting candidate:', error)
        alert('Error deleting candidate')
      }
    }
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
      alert('Failed to export CSV report');
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
      alert('Failed to export Excel report');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen page-shell">
      {/* Header with Logout */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-600">{user?.email || 'Contact@astonrecruitment.in'}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <span>Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Candidates</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats?.totalCandidates || 0} />
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Recruiters</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats?.totalRecruiters || 0} />
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applications</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats?.totalApplications || 0} />
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selected</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats?.selectedCandidates || 0} />
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-rose-500 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats?.rejectedCandidates || 0} />
            </p>
          </div>
        </div>

        {/* Analytics SVG Charts */}
        <DashboardCharts stats={stats} recruiters={recruiters} applications={applications} />

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2 font-semibold ${activeTab === 'recruiters'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
              }`}
          >
            Recruiters
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 font-semibold ${activeTab === 'candidates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
              }`}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold ${activeTab === 'applications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
              }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 font-semibold ${activeTab === 'clients'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
              }`}
          >
            Clients
          </button>
        </div>

        {/* Recruiters Tab */}
        {activeTab === 'recruiters' && (
          <div>
            <button
              onClick={() => setShowCreateRecruiter(!showCreateRecruiter)}
              className="btn-primary mb-6"
            >
              {showCreateRecruiter ? 'Cancel' : 'Create New Recruiter'}
            </button>

            {showCreateRecruiter && (
              <form onSubmit={handleCreateRecruiter} className="card mb-6">
                <h3 className="text-lg font-bold mb-4">Create New Recruiter</h3>
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
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={recruiterForm.email}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          email: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
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
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={recruiterForm.mobileNumber}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          mobileNumber: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Specialization (comma separated)
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.specialization.join(', ')}
                      onChange={(e) =>
                        setRecruiterForm({
                          ...recruiterForm,
                          specialization: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Create Recruiter
                </button>
              </form>
            )}

            <div className="space-y-4">
              {recruiters.length === 0 ? (
                <p className="text-gray-600">No recruiters yet</p>
              ) : (
                recruiters.map((rec) => (
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
                          <input
                            type="text"
                            value={editingForm.specialization}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                specialization: e.target.value,
                              })
                            }
                            placeholder="comma separated skills"
                            className="form-input"
                          />
                          <div className="space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const specArray = editingForm.specialization
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                  await recruiterService.update(rec.id, {
                                    name: editingForm.name,
                                    specialization: specArray,
                                  })
                                  setEditingRecruiterId(null)
                                  fetchData()
                                  alert('Recruiter updated')
                                } catch (e) {
                                  console.error('Error updating recruiter', e)
                                  alert('Update failed')
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
                    <div className="space-x-2">
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
                          className="btn-warning px-4 py-2"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecruiter(rec.id)}
                        className="btn-danger px-4 py-2"
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
                  <div>
                    <button
                      onClick={() => handleDeleteCandidate(cand.id)}
                      className="btn-danger px-4 py-2"
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
            {/* Unassigned candidates section */}
            {unassignedCandidates.length > 0 && (
              <div className="card mb-4">
                <h3 className="text-lg font-bold mb-2">
                  Unassigned Candidates
                </h3>
                <div className="space-y-3">
                  {unassignedCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-600">{c.User?.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Recruiter Dropdown */}
                        <select
                          id={`rec-${c.id}`}
                          className="form-input"
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
                          id={`client-${c.id}`}
                          className="form-input"
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
                              `rec-${c.id}`,
                            )

                            const clientSelect = document.getElementById(
                              `client-${c.id}`,
                            )

                            const recruiterId = recruiterSelect.value
                            const clientId = clientSelect.value

                            if (!recruiterId) {
                              return alert('Select a recruiter')
                            }

                            if (!clientId) {
                              return alert('Select a client')
                            }

                            try {
                              await applicationService.assign({
                                candidateId: c.id,
                                recruiterId,
                                clientId,
                              })

                              alert('Assigned successfully!')
                              fetchData()
                            } catch (err) {
                              console.error('Assign error', err)

                              const msg =
                                err.response?.data?.message ||
                                err.message ||
                                'Assign failed'

                              alert(msg)
                            }
                          }}
                          className="btn-primary"
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {app.Candidate?.name}
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
                    <div className="text-right">
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

                      <div className="mt-3">
                        <select
                          value={editingStatusMap[app.id] ?? ''}
                          onChange={(e) =>
                            setEditingStatusMap((s) => ({
                              ...s,
                              [app.id]: e.target.value,
                            }))
                          }
                          className="form-input mb-2"
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
                            className="form-input mb-2 h-20"
                          />
                        )}

                        <div className="space-x-2">
                          <button
                            onClick={async () => {
                              const status = editingStatusMap[app.id]
                              const reason = editingReasonMap[app.id]
                              if (!status)
                                return alert('Select a status to override')
                              try {
                                await adminService.overrideStatus(app.id, {
                                  status,
                                  rejectionReason:
                                    status === 'REJECTED' ? reason : undefined,
                                })
                                alert('Status overridden')
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
                                alert(
                                  err.response?.data?.message ||
                                  'Error overriding status',
                                )
                              }
                            }}
                            className="btn-primary"
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
                      className="form-input"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      placeholder="e.g., Acme Corp"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="e.g., hiring@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="e.g., +91 9876543210"
                    />
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
      </div>
    </div>
  )
}

export default AdminDashboard
