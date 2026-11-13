import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import Sparkline from '../components/Sparkline.jsx'

const LEVELS = {
  ok: { icon: CheckCircle2, tone: 'text-emerald-300', ring: 'border-emerald-400/30' },
  info: { icon: Info, tone: 'text-nova-ice', ring: 'border-nova-ice/30' },
  warn: { icon: AlertTriangle, tone: 'text-amber-300', ring: 'border-amber-300/30' },
}

const CHANNELS = ['all', 'core', 'focus', 'weather', 'voice', 'sync', 'insight']

export default function SignalsView({ briefing }) {
  const [channel, setChannel] = useState('all')

  const feed = briefing?.signals ?? []
  const visible = channel === 'all' ? feed : feed.filter((item) => item.channel === channel)

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto xl:grid-cols-[1.4fr_1fr] xl:overflow-hidden">
      <div className="flex min-h-0 flex-col gap-5">
        <section className="glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
                Signal volume
              </p>
              <p className="mt-1 text-sm text-white/55">Last 24 hours</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5">
              <Activity className="h-4 w-4 text-nova-orchid" />
              <span className="font-display text-sm font-semibold tabular-nums text-white">
                {briefing?.snapshot?.signals_processed?.toLocaleString() ?? '—'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Sparkline points={briefing?.activity} height="h-40" showAxis />
          </div>
        </section>

        <section className="glass flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b hairline px-6 py-4">
            <p className="mr-2 font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
              Event feed
            </p>
            {CHANNELS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setChannel(option)}
                className={`rounded-full border px-3 py-1 text-[0.7rem] capitalize transition ${
                  channel === option
                    ? 'border-nova-orchid/60 bg-nova-orchid/15 text-white'
                    : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/80'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-white/[0.05] overflow-y-auto px-6">
            {visible.map((item, index) => {
              const level = LEVELS[item.level] ?? LEVELS.info
              const Icon = level.icon
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center gap-4 py-3.5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${level.ring} bg-white/[0.03]`}
                  >
                    <Icon className={`h-4 w-4 ${level.tone}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/85">{item.label}</p>
                    <p className="text-[0.65rem] uppercase tracking-widest text-white/35">
                      {item.channel} ·{' '}
                      {new Date(item.at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="font-display text-sm tabular-nums text-white/50">
                    {item.magnitude}
                  </span>
                </motion.li>
              )
            })}
            {visible.length === 0 && (
              <li className="py-10 text-center text-sm text-white/35">
                No events on this channel right now.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="glass p-6 xl:min-h-0 xl:overflow-y-auto">
        <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
          Channel breakdown
        </p>

        <ul className="mt-5 space-y-5">
          {(briefing?.channels ?? []).map((item, index) => (
            <li key={item.channel}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm capitalize text-white/70">{item.channel}</span>
                <span className="font-display text-sm font-semibold tabular-nums text-white">
                  {item.share}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-nova-ice via-nova-violet to-nova-plasma"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.share}%` }}
                  transition={{ duration: 0.9, delay: index * 0.07, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-white/30">
                {item.count.toLocaleString()} signals
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
