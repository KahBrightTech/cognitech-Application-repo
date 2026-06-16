/**
 * Animated SVG circular progress ring showing match percentage.
 */
export default function CircularProgress({ percentage, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = (pct) => {
    if (pct >= 85) return { stroke: '#22c55e', text: 'text-green-600', bg: 'bg-green-50' }
    if (pct >= 70) return { stroke: '#14b8a6', text: 'text-teal-600',  bg: 'bg-teal-50'  }
    if (pct >= 55) return { stroke: '#6366f1', text: 'text-indigo-600', bg: 'bg-indigo-50' }
    if (pct >= 40) return { stroke: '#f59e0b', text: 'text-amber-600',  bg: 'bg-amber-50'  }
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-50' }
  }

  const { stroke, text, bg } = getColor(percentage)

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full ${bg}`}
         style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={6}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          className="progress-ring"
        />
      </svg>
      <span className={`absolute text-sm font-bold ${text}`}>
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
