import { Clock, Gauge, Timer, Zap } from 'lucide-react'

import Meter from '../components/Meter.jsx'
import Recommendations from '../components/Recommendations.jsx'
import Sparkline from '../components/Sparkline.jsx'
import WeatherCard from '../components/WeatherCard.jsx'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="glass glass-hover flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-violet/30 to-nova-plasma/10">
        <Icon className="h-5 w-5 text-nova-orchid" />
      </span>
      <div>
        <p className="font-display text-xl font-semibold tabular-nums text-white">{value}</p>
        <p className="text-[0.65rem] uppercase tracking-widest text-white/35">{label}</p>
      </div>
    </div>
  )
}

export default function VitalsView({ briefing, chat }) {
  const snapshot = briefing?.snapshot

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto xl:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Stat icon={Gauge} label="Stability" value={`${snapshot?.core_stability ?? '—'}%`} />
          <Stat icon={Timer} label="Latency" value={`${snapshot?.latency_ms ?? '—'} ms`} />
          <Stat icon={Zap} label="Energy" value={`${snapshot?.energy_level ?? '—'}%`} />
          <Stat icon={Clock} label="Sessions" value={snapshot?.active_sessions ?? '—'} />
        </div>

        <section className="glass p-6">
          <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
            Performance envelope
          </p>
          <div className="mt-5 space-y-6">
            <Meter
              label="Core stability"
              value={snapshot?.core_stability ?? 0}
              size="lg"
              accent="bg-gradient-to-r from-nova-ice to-nova-violet"
            />
            <Meter
              label="Focus score"
              value={snapshot?.focus_score ?? 0}
              size="lg"
              accent="bg-gradient-to-r from-nova-violet to-nova-plasma"
            />
            <Meter
              label="Energy level"
              value={snapshot?.energy_level ?? 0}
              size="lg"
              accent="bg-gradient-to-r from-nova-plasma to-amber-300"
            />
          </div>

          <div className="mt-7 border-t hairline pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Peak focus window</span>
              <span className="font-medium text-white">{snapshot?.focus_window ?? '—'}</span>
            </div>
            <Sparkline points={briefing?.activity} height="h-28" showAxis />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <WeatherCard weather={briefing?.weather} />
        <Recommendations items={briefing?.recommendations} onAsk={chat.onSubmit} />
      </div>
    </div>
  )
}
