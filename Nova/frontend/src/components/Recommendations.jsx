import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const ACCENTS = {
  violet: 'from-nova-violet/25 to-transparent text-nova-orchid',
  cyan: 'from-nova-ice/25 to-transparent text-nova-ice',
  emerald: 'from-emerald-400/25 to-transparent text-emerald-300',
  fuchsia: 'from-nova-plasma/25 to-transparent text-nova-plasma',
  amber: 'from-amber-300/25 to-transparent text-amber-300',
}

export default function Recommendations({ items, onAsk }) {
  if (!items?.length) {
    return <div className="glass h-48 animate-pulse" />
  }

  return (
    <section className="glass p-6">
      <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        Recommended for you
      </p>

      <ul className="mt-4 space-y-3">
        {items.map((item, index) => {
          const accent = ACCENTS[item.accent] ?? ACCENTS.violet
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <button
                type="button"
                onClick={() => onAsk?.(`Tell me more about this: ${item.title}`)}
                title={`Ask NOVA about "${item.title}"`}
                className={`group relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r ${accent}
                            p-4 text-left transition duration-300 hover:border-white/20`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em]">
                    {item.tag}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70" />
                </div>
                <p className="mt-2 font-display text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{item.detail}</p>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
