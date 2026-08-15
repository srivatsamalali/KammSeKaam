import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { recruiterService, applicationService } from '../services/api'

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

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://meet.jit.si/external_api.js'
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
      const domain = 'meet.jit.si'
      const options = {
        roomName: `KaamSeKaam-Interview-${roomId}`,
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
    if (user?.role === 'RECRUITER') {
      const loadAppDetails = async () => {
        try {
          const res = await recruiterService.getApplications()
          const matchingApp = res.data.find(
            (app) => app.googleMeetLink && app.googleMeetLink.includes(roomId)
          )
          if (matchingApp) {
            setAppDetails(matchingApp)
            setNotes(matchingApp.feedbackComments || '')
          }
        } catch (err) {
          console.error('Error loading application details in meeting room:', err)
        }
      }
      loadAppDetails()
    }
  }, [user, roomId])

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
    <div className="flex flex-col h-[85vh] w-full bg-transparent text-slate-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-800 dark:text-amber-500">
            Aston Interview Room
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Room Code: #{roomId}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Exit Room
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full">
        {/* Jitsi meeting video */}
        <div
          className={`bg-black rounded-xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50 h-full ${
            user?.role === 'RECRUITER' && appDetails ? 'lg:w-2/3 w-full' : 'w-full'
          }`}
        >
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Recruiter Workspace Sidebar */}
        {user?.role === 'RECRUITER' && appDetails && (
          <div className="lg:w-1/3 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col h-full overflow-y-auto shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
              Recruiter Interview Workspace
            </h2>

            {/* Candidate Details */}
            <div className="space-y-3 flex-1">
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
