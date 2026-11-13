import { motion } from 'framer-motion'

const STATE_STYLES = {
  idle: {
    label: 'Standing by',
    core: 'from-nova-violet via-nova-orchid to-nova-plasma',
    halo: 'bg-nova-violet/30',
    scale: [1, 1.04, 1],
    duration: 6,
  },
  listening: {
    label: 'Listening',
    core: 'from-nova-ice via-nova-orchid to-nova-violet',
    halo: 'bg-nova-ice/40',
    scale: [1, 1.12, 0.98, 1.08, 1],
    duration: 1.6,
  },
  thinking: {
    label: 'Thinking',
    core: 'from-nova-plasma via-nova-violet to-nova-ice',
    halo: 'bg-nova-plasma/40',
    scale: [1, 1.06, 1],
    duration: 2.2,
  },
  speaking: {
    label: 'Responding',
    core: 'from-nova-orchid via-nova-plasma to-nova-ice',
    halo: 'bg-nova-orchid/45',
    scale: [1, 1.09, 1.01, 1.07, 1],
    duration: 2,
  },
}

const BARS = Array.from({ length: 28 })

export default function NovaOrb({ state = 'idle', onActivate }) {
  const style = STATE_STYLES[state] ?? STATE_STYLES.idle
  const active = state === 'listening' || state === 'speaking'

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
      {/* Square stage: everything inside is sized as a % of it, so the rings
          always scale to the panel instead of being clipped by it. */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="relative aspect-square h-full max-h-[20rem]">
          <motion.div
            aria-hidden="true"
            className={`absolute inset-[6%] rounded-full blur-[70px] ${style.halo}`}
            animate={{ scale: style.scale, opacity: active ? [0.7, 1, 0.7] : [0.45, 0.7, 0.45] }}
            transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 animate-spin-slow rounded-full border border-nova-violet/20
                       [border-top-color:rgba(192,132,252,0.55)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[12%] animate-spin-reverse rounded-full border border-dashed border-nova-ice/20
                       [border-bottom-color:rgba(103,232,249,0.45)]"
          />

          <motion.button
            type="button"
            onClick={onActivate}
            aria-label={`NOVA core — ${style.label}. Activate voice.`}
            className="group absolute inset-[22%] flex items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-nova-orchid/50"
            animate={{ scale: style.scale }}
            transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.core} opacity-90 blur-[2px]
                          transition-opacity duration-500 group-hover:opacity-100`}
            />
            <span className="absolute inset-[4%] rounded-full bg-nova-void/85 backdrop-blur-xl" />
            <motion.span
              className={`absolute inset-[10%] rounded-full bg-gradient-to-tr ${style.core} opacity-80`}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute inset-[19%] rounded-full bg-nova-void/95" />
            <motion.span
              className={`absolute inset-[30%] rounded-full bg-gradient-to-br ${style.core} blur-[18px]`}
              animate={{ opacity: active ? [0.7, 1, 0.7] : [0.45, 0.75, 0.45] }}
              transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="absolute inset-[44%] rounded-full bg-white/90 blur-[10px]" />
            <span className="relative z-10 pl-[0.5em] font-display text-[0.7rem] uppercase tracking-[0.5em] text-white/80">
              Nova
            </span>
          </motion.button>
        </div>
      </div>

      {/* Reactive waveform */}
      <div className="mt-4 flex h-8 shrink-0 items-end gap-[3px]" aria-hidden="true">
        {BARS.map((_, index) => (
          <motion.span
            key={index}
            className="w-[3px] rounded-full bg-gradient-to-t from-nova-violet/40 to-nova-ice"
            animate={{
              height: active
                ? [6, 10 + Math.abs(Math.sin(index * 0.7)) * 22, 8, 14 + ((index * 7) % 14), 6]
                : [4, 8 + Math.abs(Math.sin(index * 0.45)) * 6, 4],
              opacity: active ? [0.5, 1, 0.6] : [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: active ? 0.9 : 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.035,
            }}
          />
        ))}
      </div>

      <p className="mt-3 shrink-0 font-display text-[0.7rem] uppercase tracking-[0.42em] text-white/50">
        {style.label}
      </p>
    </div>
  )
}
