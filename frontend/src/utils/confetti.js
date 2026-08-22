export const triggerGoldConfetti = () => {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '99999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  const width = (canvas.width = window.innerWidth)
  const height = (canvas.height = window.innerHeight)

  const colors = ['#b88f3f', '#d4af37', '#fde047', '#fef08a', '#e2e8f0', '#ffffff']
  const particles = []

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height * 0.45 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1) * 10 - 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    })
  }

  let animationFrameId
  let startTime = null

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime

    ctx.clearRect(0, 0, width, height)

    let alive = false
    for (let p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.22 // gravity
      p.vx *= 0.98 // drag
      p.rotation += p.vRotation
      p.opacity -= 0.008

      if (p.opacity > 0 && p.y < height + 50) {
        alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(p.opacity, 0)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    if (alive && elapsed < 3500) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animationFrameId)
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas)
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

export default triggerGoldConfetti
