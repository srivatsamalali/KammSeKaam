import React, { useState, useEffect } from 'react'

export const CursorSpotlight = () => {
  const [pos, setPos] = useState({ x: -500, y: -500, visible: false })

  useEffect(() => {
    // Only enable on pointer devices (not touch screens)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY, visible: true })
    }

    const handleMouseLeave = () => {
      setPos((prev) => ({ ...prev, visible: false }))
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!pos.visible) return null

  return (
    <div
      className="cursor-spotlight pointer-events-none hidden md:block"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    />
  )
}

export default CursorSpotlight
