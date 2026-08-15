import React, { useState, useEffect, useRef } from 'react'
import { messageService } from '../services/api'

const ChatThreadPanel = ({ isOpen, onClose, applicationId, candidateName, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const threadEndRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !applicationId) return

    fetchMessages()

    // Poll for new messages every 5 seconds for a real-time feel
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [isOpen, applicationId])

  useEffect(() => {
    // Smooth scroll to bottom when new messages are added
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await messageService.getMessages(applicationId)
      setMessages(res.data || [])
    } catch (err) {
      console.error('Error loading chat messages:', err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) return

    try {
      setLoading(true)
      const res = await messageService.sendMessage(applicationId, { message: trimmed })
      // Instantly append sent message to optimize responsiveness
      setMessages(prev => [...prev, res.data])
      setInputText('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to deliver message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex justify-end transition-all duration-550 ease-in-out ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'
    }`}>
      {/* Dark blur backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out Sheet Panel */}
      <div className={`relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Interview Chat Loop
            </h3>
            <p className="text-[10px] text-slate-500">
              Candidate: <span className="font-semibold text-amber-700 dark:text-amber-500">{candidateName}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs text-slate-400 font-semibold">No messages in this loop yet.</p>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1">Start typing below to loop in the Candidate, Recruiter, and Clients on active updates.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs shadow-xs transition-all leading-relaxed ${
                    isMine 
                      ? 'bg-amber-600 text-white rounded-br-none font-medium' 
                      : 'bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none font-medium'
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-semibold">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              )
            })
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Input Bar Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-2 items-center">
          <input 
            type="text"
            placeholder="Type message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="form-input text-xs h-9 py-1 flex-1 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-850"
          />
          <button 
            type="submit"
            disabled={loading || !inputText.trim()}
            className="btn-primary text-xs h-9 px-4 shrink-0 font-bold flex items-center justify-center gap-1.5"
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatThreadPanel
