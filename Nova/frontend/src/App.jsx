import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import AuroraBackground from './components/AuroraBackground.jsx'
import Sidebar, { NAV } from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import { useVoice } from './hooks/useVoice.js'
import { getBriefing, sendMessage } from './lib/api.js'
import AssistantView from './views/AssistantView.jsx'
import ExploreView from './views/ExploreView.jsx'
import SettingsView from './views/SettingsView.jsx'
import SignalsView from './views/SignalsView.jsx'
import UniverseView from './views/UniverseView.jsx'
import VitalsView from './views/VitalsView.jsx'

const WELCOME = {
  id: 'welcome',
  role: 'nova',
  text: "I'm NOVA. Everything you say stays inside this container. Tap the core or the mic to talk, or just type below.",
}

const HEADINGS = {
  universe: { title: 'NOVA', subtitle: 'Personal AI Universe' },
  assistant: { title: 'Assistant', subtitle: 'Conversation' },
  signals: { title: 'Signals', subtitle: 'Live event stream' },
  vitals: { title: 'Vitals', subtitle: 'Core diagnostics' },
  explore: { title: 'Explore', subtitle: 'The solar system' },
  settings: { title: 'Settings', subtitle: 'Preferences' },
}

const DEFAULT_SETTINGS = {
  autoSpeak: false,
  ambient: true,
  voiceEnabled: true,
  refreshMs: 60000,
}

export default function App() {
  const [section, setSection] = useState('universe')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [briefing, setBriefing] = useState(null)
  const [online, setOnline] = useState(true)
  const [messages, setMessages] = useState([WELCOME])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)

  const spokenInput = useRef(false)
  const messageId = useRef(0)
  const voiceRef = useRef(null)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const appendMessage = useCallback((role, text) => {
    messageId.current += 1
    setMessages((previous) => [...previous, { id: `m${messageId.current}`, role, text }])
  }, [])

  const handleSubmit = useCallback(
    async (rawText) => {
      const text = rawText.trim()
      if (!text || thinking) return

      appendMessage('user', text)
      setDraft('')
      setThinking(true)

      try {
        const { reply } = await sendMessage(text)
        appendMessage('nova', reply)
        setOnline(true)
        if (spokenInput.current || settingsRef.current.autoSpeak) voiceRef.current?.speak(reply)
      } catch {
        setOnline(false)
        appendMessage('nova', "I can't reach my core right now. Check that the API is running.")
      } finally {
        spokenInput.current = false
        setThinking(false)
      }
    },
    [appendMessage, thinking],
  )

  const voice = useVoice({
    onTranscript: (transcript) => {
      spokenInput.current = true
      handleSubmit(transcript)
    },
  })

  // Lets handleSubmit reach `speak` without re-creating the voice hook.
  voiceRef.current = voice

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getBriefing()
        if (!cancelled) {
          setBriefing(data)
          setOnline(true)
        }
      } catch {
        if (!cancelled) setOnline(false)
      }
    }

    load()
    const timer = setInterval(load, settings.refreshMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [settings.refreshMs])

  const orbState = voice.listening
    ? 'listening'
    : thinking
      ? 'thinking'
      : voice.speaking
        ? 'speaking'
        : 'idle'

  const voiceActive = voice.supported && settings.voiceEnabled

  const chat = {
    messages,
    draft,
    onDraftChange: setDraft,
    onSubmit: handleSubmit,
    thinking,
    orbState,
    voice: {
      ...voice,
      supported: voiceActive,
      browserSupported: voice.supported,
      startListening: voiceActive ? voice.startListening : () => {},
    },
  }

  const heading = HEADINGS[section] ?? HEADINGS.universe

  const renderView = () => {
    switch (section) {
      case 'assistant':
        return <AssistantView chat={chat} />
      case 'signals':
        return <SignalsView briefing={briefing} />
      case 'vitals':
        return <VitalsView briefing={briefing} chat={chat} />
      case 'explore':
        return <ExploreView chat={chat} onNavigate={setSection} />
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onChange={setSettings}
            briefing={briefing}
            voiceSupported={voice.supported}
          />
        )
      default:
        return <UniverseView briefing={briefing} chat={chat} onNavigate={setSection} />
    }
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AuroraBackground ambient={settings.ambient} />

      <div className="relative z-10 flex h-full w-full gap-4 p-4 sm:p-5">
        <Sidebar active={section} onSelect={setSection} />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <TopBar
            title={heading.title}
            subtitle={heading.subtitle}
            online={online}
            latency={briefing?.snapshot?.latency_ms}
          />

          <nav aria-label="Sections" className="flex flex-wrap gap-2">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  section === id
                    ? 'border-nova-orchid/60 bg-nova-orchid/15 text-white'
                    : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <motion.div
            key={section}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {renderView()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
