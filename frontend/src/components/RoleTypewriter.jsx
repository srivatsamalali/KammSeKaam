import React, { useState, useEffect } from 'react'

export const RoleTypewriter = ({
  roles = [
    'Technology Leaders',
    'GCC Directors',
    'Investment Bankers',
    'AI & Cloud Architects',
    'Chief Operations Officers',
    'Growth Strategists',
  ],
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseTime = 1800,
  className = '',
}) => {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timer
    const currentFullText = roles[roleIndex]

    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length - 1))
        }, deletingSpeed)
      } else {
        setIsDeleting(false)
        setRoleIndex((prev) => (prev + 1) % roles.length)
      }
    } else {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length + 1))
        }, typingSpeed)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, pauseTime)
      }
    }

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, roleIndex, roles, typingSpeed, deletingSpeed, pauseTime])

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="gold-text-shimmer font-bold">{displayText}</span>
      <span className="w-[2px] h-6 bg-[#b88f3f] ml-1 animate-pulse shadow-[0_0_8px_rgba(184,143,63,0.8)]" />
    </span>
  )
}

export default RoleTypewriter
