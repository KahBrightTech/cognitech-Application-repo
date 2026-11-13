import { Compass, Gauge, LayoutGrid, Settings, Sparkles, Waves } from 'lucide-react'

export const NAV = [
  { id: 'universe', label: 'Universe', icon: LayoutGrid },
  { id: 'assistant', label: 'Assistant', icon: Sparkles },
  { id: 'signals', label: 'Signals', icon: Waves },
  { id: 'vitals', label: 'Vitals', icon: Gauge },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <nav
      aria-label="Primary"
      className="glass z-10 flex w-16 shrink-0 flex-col items-center gap-1.5 py-5 sm:w-20 sm:py-6"
    >
      <button
        type="button"
        onClick={() => onSelect('universe')}
        title="NOVA home"
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-violet to-nova-plasma shadow-glow transition hover:brightness-110"
      >
        <Sparkles className="h-5 w-5 text-white" />
      </button>

      {NAV.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={isActive ? 'page' : undefined}
            title={label}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300
              ${isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
          >
            {isActive && (
              <span className="absolute left-0 h-6 w-[3px] rounded-r-full bg-nova-orchid shadow-glow" />
            )}
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
