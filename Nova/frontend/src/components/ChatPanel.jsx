import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MicOff, SendHorizontal, Square } from 'lucide-react'

const SUGGESTIONS = [
  { label: 'Weather', query: "What's the weather?" },
  { label: 'Status', query: 'System status' },
  { label: 'Focus', query: 'What should I focus on?' },
  { label: 'Space', query: 'Tell me something about space' },
  { label: 'Help', query: 'What can you do?' },
]

export default function ChatPanel({
  messages,
  draft,
  onDraftChange,
  onSubmit,
  thinking,
  voice,
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <section className="glass flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b hairline px-6 py-4">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-wide text-white">
            Conversation
          </h2>
          <p className="text-[0.7rem] text-white/40">
            {voice.supported ? 'Type or hold a conversation out loud' : 'Type to talk to NOVA'}
          </p>
        </div>
        {voice.speaking && (
          <button
            type="button"
            onClick={voice.cancelSpeech}
            className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-nova-orchid/50 hover:text-white"
          >
            <Square className="h-3 w-3" /> Stop
          </button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-nova-violet to-nova-plasma text-white shadow-glow'
                    : 'border border-white/10 bg-white/[0.05] text-white/85'
                }`}
              >
                {message.role === 'nova' && (
                  <p className="mb-1 font-display text-[0.6rem] uppercase tracking-[0.3em] text-nova-orchid">
                    Nova
                  </p>
                )}
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {voice.interim && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl border border-dashed border-nova-ice/40 px-4 py-3 text-sm italic text-nova-ice/80">
              {voice.interim}
            </div>
          </div>
        )}

        {thinking && (
          <div className="flex items-center gap-1.5 pl-1" aria-label="NOVA is thinking">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2 w-2 rounded-full bg-nova-orchid"
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t hairline px-6 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(({ label, query }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSubmit(query)}
              title={query}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.7rem] text-white/55 transition hover:border-nova-orchid/50 hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(draft)
          }}
          className="flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            maxLength={2000}
            placeholder="Ask NOVA anything…"
            aria-label="Message NOVA"
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-nova-orchid/60 focus:bg-white/[0.07]"
          />

          <button
            type="button"
            onClick={voice.listening ? voice.stopListening : voice.startListening}
            disabled={!voice.supported}
            title={
              voice.supported
                ? 'Talk to NOVA'
                : voice.browserSupported
                  ? 'Voice input is switched off in Settings'
                  : 'Voice input is not supported in this browser'
            }
            aria-label={voice.listening ? 'Stop listening' : 'Start voice input'}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-35 ${
              voice.listening
                ? 'border-nova-ice/60 bg-nova-ice/15 text-nova-ice shadow-glow'
                : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
            }`}
          >
            {voice.supported ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            type="submit"
            disabled={!draft.trim() || thinking}
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-violet to-nova-plasma text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  )
}
