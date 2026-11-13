import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircleQuestion, Orbit } from 'lucide-react'

const DESTINATIONS = [
  {
    id: 'mercury',
    name: 'Mercury',
    tagline: 'The scorched runner',
    gradient: 'from-amber-200 via-orange-400 to-stone-600',
    distance: '0.39 AU',
    dayLength: '58.6 days',
    moons: 0,
    blurb:
      'Closest to the Sun and barely holding an atmosphere. Its surface swings from 430°C in daylight to -180°C at night.',
  },
  {
    id: 'venus',
    name: 'Venus',
    tagline: 'The runaway greenhouse',
    gradient: 'from-yellow-100 via-amber-300 to-orange-700',
    distance: '0.72 AU',
    dayLength: '243 days',
    moons: 0,
    blurb:
      'A day on Venus lasts longer than its year, and its crushing CO₂ atmosphere traps enough heat to melt lead.',
  },
  {
    id: 'earth',
    name: 'Earth',
    tagline: 'Home base',
    gradient: 'from-sky-300 via-blue-500 to-emerald-600',
    distance: '1.00 AU',
    dayLength: '24 hours',
    moons: 1,
    blurb:
      'The only place we know where liquid water, a magnetic shield, and a stable climate overlap at the same time.',
  },
  {
    id: 'mars',
    name: 'Mars',
    tagline: 'The next frontier',
    gradient: 'from-orange-300 via-red-500 to-rose-900',
    distance: '1.52 AU',
    dayLength: '24.6 hours',
    moons: 2,
    blurb:
      'Home to Olympus Mons, the tallest volcano in the solar system, and a thin atmosphere that still kicks up planet-wide dust storms.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    tagline: 'The storm king',
    gradient: 'from-orange-200 via-amber-500 to-amber-900',
    distance: '5.20 AU',
    dayLength: '9.9 hours',
    moons: 95,
    blurb:
      'Its Great Red Spot is a storm wider than Earth that has been spinning for centuries. It also has the shortest day of any planet.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    tagline: 'The ringed giant',
    gradient: 'from-yellow-100 via-amber-200 to-yellow-700',
    distance: '9.58 AU',
    dayLength: '10.7 hours',
    moons: 146,
    blurb:
      'Its rings are mostly water ice, some chunks the size of houses, spread across a span wider than the Earth-Moon distance.',
  },
]

function Planet({ destination, active, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(destination)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={active}
      className={`glass group relative overflow-hidden p-5 text-left transition-colors duration-300 ${
        active ? 'border-nova-orchid/60 bg-white/[0.08]' : 'hover:border-white/25'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <span
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${destination.gradient} opacity-90 blur-[1px]`}
          />
          <motion.span
            className="absolute inset-0 rounded-full ring-1 ring-white/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-white">{destination.name}</p>
          <p className="truncate text-xs text-white/45">{destination.tagline}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[0.65rem] uppercase tracking-widest text-white/35">
        <span>{destination.distance}</span>
        <span>{destination.moons} moons</span>
      </div>
    </motion.button>
  )
}

export default function ExploreView({ chat, onNavigate }) {
  const [selected, setSelected] = useState(DESTINATIONS[3])

  const askNova = () => {
    chat.onSubmit(`Tell me something about space — specifically ${selected.name}.`)
    onNavigate('assistant')
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto xl:grid-cols-[1.3fr_1fr]">
      <section>
        <p className="mb-4 font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
          Pick a destination
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <Planet
              key={destination.id}
              destination={destination}
              active={selected.id === destination.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.aside
          key={selected.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="glass relative flex flex-col overflow-hidden p-7"
        >
          <div
            className={`absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${selected.gradient} opacity-25 blur-3xl`}
          />

          <div className="relative flex justify-center py-6">
            <motion.span
              className={`h-36 w-36 rounded-full bg-gradient-to-br ${selected.gradient} shadow-glow-lg`}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="h-52 w-52 animate-spin-slow rounded-full border border-dashed border-white/15" />
            </span>
          </div>

          <h2 className="relative mt-4 font-display text-3xl font-bold text-white">
            {selected.name}
          </h2>
          <p className="relative mt-1 text-sm text-nova-orchid">{selected.tagline}</p>
          <p className="relative mt-4 text-sm leading-relaxed text-white/60">{selected.blurb}</p>

          <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t hairline pt-5 text-center">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-widest text-white/35">Distance</dt>
              <dd className="mt-1 font-display text-sm text-white">{selected.distance}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-widest text-white/35">Day</dt>
              <dd className="mt-1 font-display text-sm text-white">{selected.dayLength}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-widest text-white/35">Moons</dt>
              <dd className="mt-1 font-display text-sm text-white">{selected.moons}</dd>
            </div>
          </dl>

          <div className="relative mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={askNova}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-nova-violet to-nova-plasma px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Ask NOVA about {selected.name}
            </button>
            <button
              type="button"
              onClick={() => setSelected(DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)])}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:border-nova-orchid/50 hover:text-white"
            >
              <Orbit className="h-4 w-4" />
              Surprise me
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>
    </div>
  )
}
