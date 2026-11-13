import { motion } from 'framer-motion'

export default function Meter({ label, value, suffix = '%', accent, size = 'sm' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40">{label}</span>
        <span
          className={`font-display font-semibold tabular-nums text-white ${
            size === 'lg' ? 'text-2xl' : 'text-sm'
          }`}
        >
          {value}
          {suffix}
        </span>
      </div>
      <div
        className={`mt-2 overflow-hidden rounded-full bg-white/[0.07] ${
          size === 'lg' ? 'h-2.5' : 'h-1.5'
        }`}
      >
        <motion.div
          className={`h-full rounded-full ${accent}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
