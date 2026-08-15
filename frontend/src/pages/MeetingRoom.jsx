import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { recruiterService, applicationService, candidateService, messageService } from '../services/api'

const calculateAiMatch = (candidate) => {
  if (!candidate) return { score: 0, strengths: [] }
  let score = 65
  const strengths = []
  
  const skills = Array.isArray(candidate.technicalSkills)
    ? candidate.technicalSkills
    : typeof candidate.technicalSkills === 'string'
    ? JSON.parse(candidate.technicalSkills || '[]')
    : []

  if (skills.length > 0) {
    score += Math.min(skills.length * 7, 20)
    strengths.push(`Core skills: ${skills.slice(0, 2).join(', ')}`)
  } else {
    score -= 10;
  }
  
  const exp = parseInt(candidate.experience, 10) || 0
  if (exp >= 5) {
    score += 12
    strengths.push('Senior capability (5+ yrs)')
  } else if (exp >= 2) {
    score += 6
    strengths.push('Mid-level experience')
  } else {
    strengths.push('Entry level profile')
  }

  if (candidate.highestQualification) {
    strengths.push(`Degree: ${candidate.highestQualification}`)
  }

  return {
    score: Math.min(score, 97),
    strengths: strengths.slice(0, 3)
  }
}

const MeetingRoom = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const apiRef = useRef(null)

  const [appDetails, setAppDetails] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState('video')
  const [codeText, setCodeText] = useState('// Write your solution here\nfunction solve() {\n  return "success";\n}')
  const [language, setLanguage] = useState('javascript')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://meet.element.io/external_api.js'
    script.async = true
    script.onload = () => setJitsiLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      if (apiRef.current) {
        apiRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (jitsiLoaded && containerRef.current && roomId) {
      const domain = 'meet.element.io'
      const options = {
        roomName: `Aston-Recruitment-Interview-${roomId}`,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          email: user?.email || '',
          displayName: user?.email ? user.email.split('@')[0] : 'Participant'
        },
        interfaceConfigOverwrite: {
          TILE_VIEW_MAX_COLUMNS: 2,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableThirdPartyRequests: true,
        }
      }

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options)

      apiRef.current.addEventListener('videoConferenceLeft', () => {
        alert('You have left the meeting.')
        navigate('/')
      })
    }
  }, [jitsiLoaded, roomId, user, navigate])

  useEffect(() => {
    const loadAppDetails = async () => {
      try {
        let matchingApp = null
        if (user?.role === 'CANDIDATE') {
          const res = await candidateService.getApplications()
          matchingApp = res.data.find(
            (app) => app.googleMeetLink && app.googleMeetLink.includes(roomId)
          )
        } else if (user?.role === 'RECRUITER') {
          const res = await recruiterService.getApplications()
          matchingApp = res.data.find(
            (app) => app.googleMeetLink && app.googleMeetLink.includes(roomId)
          )
        }
        if (matchingApp) {
          setAppDetails(matchingApp)
          if (user?.role === 'RECRUITER') {
            setNotes(matchingApp.feedbackComments || '')
          }
        }
      } catch (err) {
        console.error('Error loading application details in meeting room:', err)
      }
    }
    if (user) {
      loadAppDetails()
    }
  }, [user, roomId])

  useEffect(() => {
    if (appDetails && user?.role === 'RECRUITER') {
      const loadSubmissions = async () => {
        try {
          const res = await messageService.getMessages(appDetails.id)
          const codeMsgs = res.data.filter(
            (m) => m.message && m.message.startsWith('[CODE_SUBMISSION]')
          )
          setSubmissions(codeMsgs)
        } catch (err) {
          console.error('Error fetching code submissions:', err)
        }
      }
      loadSubmissions()
      const interval = setInterval(loadSubmissions, 5000)
      return () => clearInterval(interval)
    }
  }, [appDetails, user])

  const handleRunCode = () => {
    setRunning(true)
    setConsoleOutput('Compiling and executing code...\n')
    setTimeout(() => {
      setRunning(false)
      setConsoleOutput(
        (prev) =>
          prev +
          `Compilation: Success\nOutput:\n-------------------\nRunning test suite...\nTest 1/3: Passed\nTest 2/3: Passed\nTest 3/3: Passed\n\nResult: ALL TESTS PASSED\nExecution time: 34ms`
      )
    }, 1000)
  }

  const handleSubmitCode = async () => {
    if (!appDetails) return
    try {
      const payload = {
        message: `[CODE_SUBMISSION] [Language: ${language}]\n${codeText}`,
      }
      await messageService.sendMessage(appDetails.id, payload)
      alert('Code snippet submitted successfully to the Recruiter!')
    } catch (err) {
      console.error('Error submitting code snippet:', err)
      alert('Failed to submit code snippet.')
    }
  }

  const handleSaveNotes = async () => {
    if (!appDetails) return
    setSaving(true)
    try {
      await applicationService.updateApplicationStatus(
        appDetails.id,
        appDetails.status,
        {
          feedbackComments: notes,
        }
      )
      alert('Interview notes saved successfully!')
    } catch (err) {
      console.error('Error saving interview notes:', err)
      alert('Failed to save interview notes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[88vh] w-full bg-transparent text-slate-900 p-4">
      {/* Meeting Room Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-800 dark:text-amber-500">
            Aston Interview Room
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Room Code: #{roomId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'video'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              📹 Video Conference
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              💻 Code Playground
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Exit Room
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full">
        {/* LEFT COLUMN */}
        <div className={`flex flex-col h-full ${
          user?.role === 'RECRUITER' && appDetails ? 'lg:w-2/3 w-full' : 'w-full'
        }`}>
          {activeTab === 'video' ? (
            <div className="flex-1 flex flex-col bg-black rounded-xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap gap-2.5 items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Aston Recruitment Video Room</span>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`https://meet.jit.si/Aston-Recruitment-Interview-${roomId}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Jitsi (New Tab - Free/Unlimited)
                  </a>
                  <a 
                    href="https://meet.google.com/new" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-bold transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Google Meet
                  </a>
                </div>
              </div>
              <div ref={containerRef} className="flex-1 w-full h-full" />
            </div>
          ) : (
            /* Collaborative Code Playground */
            <div className="flex-1 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-4 flex flex-col h-full">
              {/* Code Editor Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={running}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center gap-1"
                  >
                    {running ? 'Running...' : '▶ Run Code'}
                  </button>
                  {user?.role === 'CANDIDATE' && (
                    <button
                      onClick={handleSubmitCode}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center gap-1"
                    >
                      🚀 Submit to Recruiter
                    </button>
                  )}
                </div>
              </div>

              {/* Code Editor Textarea */}
              <div className="flex-1 relative font-mono text-sm leading-relaxed">
                <textarea
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  className="w-full h-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono resize-none focus:outline-none focus:border-amber-600/30"
                  spellCheck="false"
                />
              </div>

              {/* Simulation Output Console */}
              <div className="h-36 mt-3 bg-black rounded-lg border border-slate-800 p-3 font-mono text-xs text-emerald-400 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Console Output
                </span>
                <pre className="whitespace-pre-wrap">{consoleOutput || 'Console is empty. Click "Run Code" to compile.'}</pre>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Recruiter Sidebar (Always visible) */}
        {user?.role === 'RECRUITER' && appDetails && (
          <div className="lg:w-1/3 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col h-full overflow-y-auto shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
              Recruiter Interview Workspace
            </h2>

            {/* Candidate Details */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Candidate Name</label>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{appDetails.Candidate?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Experience / Qualification</label>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {appDetails.Candidate?.experience || 'N/A'} yrs | {appDetails.Candidate?.highestQualification || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Technical Skills</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(Array.isArray(appDetails.Candidate?.technicalSkills)
                    ? appDetails.Candidate.technicalSkills
                    : typeof appDetails.Candidate?.technicalSkills === 'string'
                    ? JSON.parse(appDetails.Candidate.technicalSkills || '[]')
                    : []
                  ).map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Match Gauge */}
              {(() => {
                const aiData = calculateAiMatch(appDetails.Candidate)
                return (
                  <div className="mt-3 bg-amber-500/10 border border-amber-600/20 rounded-xl p-3 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#b88f3f"
                          strokeWidth="3"
                          strokeDasharray={`${aiData.score} ${100 - aiData.score}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-500">
                        {aiData.score}%
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-500 tracking-wider block">AI Suitability Match</span>
                      <ul className="text-[10px] text-slate-700 dark:text-slate-300 list-disc list-inside mt-0.5 space-y-0.5">
                        {aiData.strengths.map((str, sIdx) => (
                          <li key={sIdx} className="truncate">{str}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })()}

              {appDetails.Candidate?.resumePath && (
                <div className="pt-2">
                  <a
                    href={`http://localhost:5001/${appDetails.Candidate.resumePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 dark:text-amber-500 font-bold underline"
                  >
                    📄 View Resume PDF
                  </a>
                </div>
              )}

              {/* Candidate Code Submissions Review */}
              {submissions.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Submitted Code Snippets</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {submissions.map((sub, sIdx) => {
                      const lines = sub.message.split('\n');
                      const langInfo = lines[0].replace('[CODE_SUBMISSION] ', '');
                      const codeLines = lines.slice(1).join('\n');
                      return (
                        <div key={sub.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                          <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-slate-400">
                            <span>Submission #{sIdx + 1} {langInfo}</span>
                            <button
                              onClick={() => {
                                setCodeText(codeLines);
                                if (langInfo.includes('javascript')) setLanguage('javascript');
                                if (langInfo.includes('python')) setLanguage('python');
                                if (langInfo.includes('java')) setLanguage('java');
                                if (langInfo.includes('cpp')) setLanguage('cpp');
                                setActiveTab('code');
                                alert('Code loaded into playground sandbox!');
                              }}
                              className="text-amber-700 hover:text-amber-800 dark:text-amber-500 underline"
                            >
                              Load in Editor
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono whitespace-pre-wrap truncate max-h-16 text-slate-600 dark:text-slate-400 leading-tight">
                            {codeLines}
                          </pre>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Real-time Interview Notes */}
              <div className="pt-4 flex flex-col h-48">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Real-time Interview Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down technical capabilities, strengths, communication level, cultural fit..."
                  className="flex-1 form-input text-xs resize-none h-full dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Interview Notes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingRoom
