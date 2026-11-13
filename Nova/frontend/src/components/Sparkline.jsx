import { motion } from 'framer-motion'

/** Line + area chart for the hourly signal series. */
export default function Sparkline({ points, height = 'h-20', showAxis = false }) {
  if (!points?.length) return null

  const values = points.map((point) => point.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(max - min, 1)

  const coords = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 100,
    y: 100 - ((value - min) / span) * 86 - 7,
  }))

  const path = coords
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')

  return (
    <div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={`${height} w-full`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="novaSparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="novaSparkLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>
        <path d={`${path} L100,100 L0,100 Z`} fill="url(#novaSparkFill)" />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#novaSparkLine)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>

      {showAxis && (
        <div className="mt-2 flex justify-between text-[0.6rem] uppercase tracking-widest text-white/30">
          {points
            .filter((_, index) => index % 6 === 0)
            .map((point) => (
              <span key={point.hour}>{point.hour}</span>
            ))}
          <span>{points[points.length - 1].hour}</span>
        </div>
      )}
    </div>
  )
}
