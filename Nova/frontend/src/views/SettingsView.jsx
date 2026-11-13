import { CheckCircle2, Mic, RefreshCw, ShieldCheck, Sparkles, Volume2 } from 'lucide-react'

function Toggle({ label, detail, checked, onChange, icon: Icon, disabled }) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="flex min-w-0 gap-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
          <Icon className="h-4 w-4 text-nova-orchid" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{detail}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${
          checked
            ? 'border-nova-orchid/60 bg-gradient-to-r from-nova-violet to-nova-plasma'
            : 'border-white/15 bg-white/[0.06]'
        }`}
      >
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

const INTERVALS = [
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
]

export default function SettingsView({ settings, onChange, briefing, voiceSupported }) {
  const update = (patch) => onChange({ ...settings, ...patch })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto xl:grid-cols-[1.4fr_1fr]">
      <section className="glass px-6 py-2">
        <div className="divide-y divide-white/[0.06]">
          <Toggle
            icon={Volume2}
            label="Speak every reply"
            detail="By default NOVA only speaks when you talk to it. Turn this on and it reads typed replies aloud too."
            checked={settings.autoSpeak}
            onChange={(value) => update({ autoSpeak: value })}
          />
          <Toggle
            icon={Sparkles}
            label="Ambient motion"
            detail="The drifting aurora and starfield behind the interface. Turn off for a calmer, lighter screen."
            checked={settings.ambient}
            onChange={(value) => update({ ambient: value })}
          />
          <Toggle
            icon={Mic}
            label="Voice input"
            detail={
              voiceSupported
                ? 'Enables the microphone button and the tap-to-talk core.'
                : 'This browser has no Web Speech API. Try Chrome or Edge.'
            }
            checked={settings.voiceEnabled && voiceSupported}
            disabled={!voiceSupported}
            onChange={(value) => update({ voiceEnabled: value })}
          />

          <div className="flex flex-wrap items-center justify-between gap-6 py-5">
            <div className="flex gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                <RefreshCw className="h-4 w-4 text-nova-orchid" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Telemetry refresh</p>
                <p className="mt-1 text-xs text-white/45">
                  How often NOVA pulls a fresh briefing from its core.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {INTERVALS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ refreshMs: option.value })}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                    settings.refreshMs === option.value
                      ? 'border-nova-orchid/60 bg-nova-orchid/15 text-white'
                      : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-5">
        <section className="glass p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <p className="font-display text-sm font-semibold text-white">Privacy</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            NOVA runs entirely inside its own containers. There are no API keys, no third-party AI
            calls, and no outbound network traffic. Speech is processed by your browser and never
            reaches the server.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-white/45">
            {['No telemetry leaves your machine', 'No accounts, no tracking', 'Conversation is in-memory only'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </section>

        <section className="glass p-6">
          <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
            Core info
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ['Location', briefing?.weather?.city ?? '—'],
              ['Latency', `${briefing?.snapshot?.latency_ms ?? '—'} ms`],
              ['Active sessions', briefing?.snapshot?.active_sessions ?? '—'],
              ['Engine', 'nova-core (offline)'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-white/45">{label}</dt>
                <dd className="font-medium text-white/85">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t hairline pt-4 text-xs leading-relaxed text-white/35">
            Change the location by setting <code className="text-white/60">NOVA_CITY</code> in
            docker-compose.yml, then rebuild the backend.
          </p>
        </section>
      </aside>
    </div>
  )
}
