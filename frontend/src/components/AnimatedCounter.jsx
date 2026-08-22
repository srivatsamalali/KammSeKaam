import React, { useState, useEffect, useRef } from 'react'

export const AnimatedCounter = ({
  target,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTimestamp = null
          const numericTarget = typeof target === 'number' ? target : parseFloat(target) || 0

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3)
            const currentVal = easeOutProgress * numericTarget

            setCount(currentVal)

            if (progress < 1) {
              window.requestAnimationFrame(step)
            } else {
              setCount(numericTarget)
            }
          }

          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.15 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [target, duration, hasAnimated])

  const formattedValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count)

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

export default AnimatedCounter
