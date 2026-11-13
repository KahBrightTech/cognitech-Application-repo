import { motion } from 'framer-motion'

import ChatPanel from '../components/ChatPanel.jsx'
import NovaOrb from '../components/NovaOrb.jsx'
import Recommendations from '../components/Recommendations.jsx'
import VitalsCard from '../components/VitalsCard.jsx'
import WeatherCard from '../components/WeatherCard.jsx'

export default function UniverseView({ briefing, chat, onNavigate }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto lg:grid-cols-[1.5fr_1fr] lg:overflow-hidden">
      <div className="flex min-h-0 flex-col gap-5">
        <motion.section
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative flex min-h-[17rem] flex-1 flex-col items-center justify-center overflow-hidden px-6 py-5"
        >
          <NovaOrb
            state={chat.orbState}
            onActivate={chat.voice.listening ? chat.voice.stopListening : chat.voice.startListening}
          />
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="mt-4 shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.25em] text-white/50 transition hover:border-nova-orchid/50 hover:text-white"
          >
            Open full assistant
          </button>
        </motion.section>

        <div className="min-h-[17rem] flex-1">
          <ChatPanel {...chat} />
        </div>
      </div>

      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="flex flex-col gap-5 [&>*]:shrink-0 lg:min-h-0 lg:overflow-y-auto lg:pr-1"
      >
        <button
          type="button"
          onClick={() => onNavigate('vitals')}
          title="Open full vitals"
          className="block w-full text-left"
        >
          <WeatherCard weather={briefing?.weather} />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('vitals')}
          title="Open full vitals"
          className="block w-full text-left"
        >
          <VitalsCard snapshot={briefing?.snapshot} activity={briefing?.activity} />
        </button>
        <Recommendations items={briefing?.recommendations} onAsk={chat.onSubmit} />
      </motion.aside>
    </div>
  )
}
