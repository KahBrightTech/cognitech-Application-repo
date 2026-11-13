import ChatPanel from '../components/ChatPanel.jsx'
import NovaOrb from '../components/NovaOrb.jsx'

export default function AssistantView({ chat }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto xl:grid-cols-[1fr_1.6fr] xl:overflow-hidden">
      <section className="glass flex min-h-[22rem] flex-col items-center justify-center overflow-hidden px-6 py-6">
        <NovaOrb
          state={chat.orbState}
          onActivate={chat.voice.listening ? chat.voice.stopListening : chat.voice.startListening}
        />
        <p className="mt-5 max-w-xs shrink-0 text-center text-xs leading-relaxed text-white/40">
          {chat.voice.supported
            ? 'Tap the core and speak. NOVA answers out loud when you talk to it.'
            : chat.voice.browserSupported
              ? 'Voice input is switched off in Settings. Typing works as normal.'
              : 'Voice input needs a Chromium-based browser. Typing works everywhere.'}
        </p>
      </section>

      <div className="min-h-[26rem] min-w-0">
        <ChatPanel {...chat} />
      </div>
    </div>
  )
}
