import { Target } from 'lucide-react'

export default function Navbar({ onLogoClick }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl animated-bg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HirePath</span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500 font-medium">
              AI-Powered Job Matching
            </span>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
