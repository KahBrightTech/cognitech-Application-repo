import Meter from './Meter.jsx'
import Sparkline from './Sparkline.jsx'

export default function VitalsCard({ snapshot, activity }) {
  if (!snapshot) {
    return <div className="glass h-72 animate-pulse" />
  }

  return (
    <article className="glass glass-hover p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
          Core vitals
        </p>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-emerald-300">
          Nominal
        </span>
      </div>

      <Sparkline points={activity} />

      <p className="-mt-1 text-[0.65rem] uppercase tracking-widest text-white/35">
        {snapshot.signals_processed.toLocaleString()} signals processed today
      </p>

      <div className="mt-5 space-y-4">
        <Meter
          label="Stability"
          value={snapshot.core_stability}
          accent="bg-gradient-to-r from-nova-ice to-nova-violet"
        />
        <Meter
          label="Focus"
          value={snapshot.focus_score}
          accent="bg-gradient-to-r from-nova-violet to-nova-plasma"
        />
        <Meter
          label="Energy"
          value={snapshot.energy_level}
          accent="bg-gradient-to-r from-nova-plasma to-amber-300"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t hairline pt-4 text-xs text-white/50">
        <span>Peak window</span>
        <span className="font-medium text-white/80">{snapshot.focus_window}</span>
      </div>
    </article>
  )
}
