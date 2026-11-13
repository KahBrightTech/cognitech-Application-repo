import { useEffect, useState } from 'react'
import { Activity, ShieldCheck } from 'lucide-react'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export default function TopBar({ title, subtitle, online, latency }) {
  const now = useClock()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="font-display text-[0.65rem] uppercase tracking-[0.5em] text-white/40">
          {subtitle}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl sm:leading-[1.15]">
          <span className="text-aurora">{title}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              online ? 'bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)]' : 'bg-rose-400'
            }`}
          />
          <span className="text-xs font-medium text-white/70">
            {online ? 'Core online' : 'Core offline'}
          </span>
        </div>

        <div className="glass hidden items-center gap-2 rounded-2xl px-4 py-2.5 sm:flex">
          <Activity className="h-4 w-4 text-nova-ice" />
          <span className="text-xs font-medium text-white/70">{latency ?? '--'} ms</span>
        </div>

        <div className="glass hidden items-center gap-2 rounded-2xl px-4 py-2.5 md:flex">
          <ShieldCheck className="h-4 w-4 text-nova-orchid" />
          <span className="text-xs font-medium text-white/70">Local only</span>
        </div>

        <div className="glass rounded-2xl px-4 py-2.5 text-right">
          <p className="font-display text-sm font-semibold tabular-nums text-white">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[0.65rem] uppercase tracking-widest text-white/40">
            {now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </header>
  )
}
