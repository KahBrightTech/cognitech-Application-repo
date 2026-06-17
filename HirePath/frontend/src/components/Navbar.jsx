import { Target, Sparkles } from 'lucide-react'

export default function Navbar({ onLogoClick }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={onLogoClick} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl animated-bg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text">HirePath</span>
          </button>

          {/* Nav links (decorative – single-page app) */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
            <button onClick={onLogoClick} className="hover:text-violet-600 transition-colors">Home</button>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400 cursor-default">How It Works</span>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400 cursor-default">About</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Live Matching</span>
            </div>
            <button
              onClick={onLogoClick}
              className="hidden sm:flex items-center gap-1.5 btn-primary !py-2 !px-4 text-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try Free
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
