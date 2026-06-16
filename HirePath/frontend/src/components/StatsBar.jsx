import { Sparkles, Globe, Star, TrendingUp } from 'lucide-react'

export default function StatsBar({ results, resumeSummary, fileName }) {
  const avgMatch = results.length
    ? Math.round(results.reduce((s, j) => s + j.match_percentage, 0) / results.length)
    : 0

  const topMatch = results.length ? Math.round(results[0].match_percentage) : 0

  const excellentCount = results.filter(j => j.match_percentage >= 85).length

  return (
    <div className="animated-bg rounded-2xl p-6 text-white mb-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: summary */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-lg">Match Analysis Complete</span>
          </div>
          <p className="text-white/80 text-sm">
            <strong className="text-white">{fileName}</strong> matched against{' '}
            <strong className="text-white">{results.length}</strong> jobs across 5 job boards
          </p>
          {resumeSummary && (
            <p className="text-white/70 text-xs mt-1">
              Detected {resumeSummary.skills.length} skills ·{' '}
              {resumeSummary.experience_years}y experience ·{' '}
              {resumeSummary.education_level.replace('_', ' ')} degree
            </p>
          )}
        </div>

        {/* Right: stat chips */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
            <Globe className="w-4 h-4 mx-auto mb-1 text-white/80" />
            <div className="text-xl font-extrabold">5</div>
            <div className="text-xs text-white/70">Boards</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-white/80" />
            <div className="text-xl font-extrabold">{topMatch}%</div>
            <div className="text-xs text-white/70">Top Match</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
            <Star className="w-4 h-4 mx-auto mb-1 text-yellow-300" />
            <div className="text-xl font-extrabold">{excellentCount}</div>
            <div className="text-xs text-white/70">Excellent</div>
          </div>
        </div>
      </div>
    </div>
  )
}
