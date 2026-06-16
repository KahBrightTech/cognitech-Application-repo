import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const SOURCES = [
  { name: 'LinkedIn',      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  { name: 'Indeed',        color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { name: 'Glassdoor',     color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200'  },
  { name: 'Monster',       color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'ZipRecruiter',  color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
]

const MESSAGES = [
  'Parsing your resume…',
  'Extracting skills & experience…',
  'Searching job boards…',
  'Calculating match scores…',
  'Ranking opportunities…',
]

export default function SearchingAnimation({ fileName }) {
  const [completedSources, setCompletedSources] = useState([])
  const [messageIdx, setMessageIdx] = useState(0)

  useEffect(() => {
    // Stagger the source completions
    SOURCES.forEach((_, i) => {
      setTimeout(() => {
        setCompletedSources(prev => [...prev, i])
      }, 600 + i * 520)
    })

    // Cycle through messages
    const msgInterval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % MESSAGES.length)
    }, 700)

    return () => clearInterval(msgInterval)
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Spinning logo */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 animated-bg rounded-full opacity-20 blur-xl animate-pulse-slow" />
          <div className="relative w-24 h-24 animated-bg rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-4xl">🎯</span>
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-violet-300 border-dashed animate-spin-slow opacity-60" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Searching for your matches</h2>
        <p className="text-slate-500 mb-1 text-sm">
          <span className="font-medium text-slate-700">{fileName}</span>
        </p>

        {/* Animated status message */}
        <div className="h-6 mb-8 overflow-hidden">
          <p className="text-violet-600 font-medium text-sm animate-fade-in" key={messageIdx}>
            {MESSAGES[messageIdx]}
          </p>
        </div>

        {/* Source cards */}
        <div className="space-y-3">
          {SOURCES.map((src, i) => {
            const done = completedSources.includes(i)
            const active = completedSources.length === i
            return (
              <div
                key={src.name}
                className={`
                  flex items-center justify-between px-5 py-3.5 rounded-2xl border
                  transition-all duration-500
                  ${done
                    ? `${src.bg} ${src.border}`
                    : active
                      ? 'bg-slate-100 border-slate-300 animate-pulse'
                      : 'bg-white border-slate-200 opacity-50'
                  }
                `}
              >
                <span className={`font-semibold text-sm ${done ? src.color : 'text-slate-400'}`}>
                  {src.name}
                </span>
                {done ? (
                  <CheckCircle2 className={`w-5 h-5 ${src.color}`} />
                ) : active ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full animated-bg rounded-full transition-all duration-500"
            style={{ width: `${(completedSources.length / SOURCES.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {completedSources.length} of {SOURCES.length} sources searched
        </p>
      </div>
    </div>
  )
}
