import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MeetingRoom = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const apiRef = useRef(null)

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

  return (
    <div className="flex flex-col h-[85vh] w-full bg-transparent text-slate-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-800">
            Aston Interview Room
          </h1>
          <p className="text-xs text-gray-500">
            Room Code: #{roomId}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-200 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
        >
          Exit Room
        </button>
      </div>
      <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-inner border border-slate-200/50">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default MeetingRoom
