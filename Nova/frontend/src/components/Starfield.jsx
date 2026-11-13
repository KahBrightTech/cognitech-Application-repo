import { useEffect, useRef } from 'react'

/** Animated starfield rendered on a canvas, sized to its parent. */
export default function Starfield({ density = 140 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    let frame = 0
    let stars = []

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.4 + 0.2,
        drift: Math.random() * 0.12 + 0.02,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      stars.forEach((star) => {
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(star.phase + frame / 60))
        context.beginPath()
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(216, 205, 255, ${twinkle * 0.8})`
        context.fill()

        star.y -= star.drift
        if (star.y < -4) {
          star.y = canvas.offsetHeight + 4
          star.x = Math.random() * canvas.offsetWidth
        }
      })
      frame += 1
      animation = requestAnimationFrame(draw)
    }

    let animation = requestAnimationFrame(draw)
    resize()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animation)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
