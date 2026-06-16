import { useState, useMemo } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import StatsBar from './StatsBar'
import FilterBar from './FilterBar'
import JobCard from './JobCard'

const DEFAULT_FILTERS = {
  source: 'all',
  jobType: 'all',
  category: 'all',
  minMatch: 0,
  sort: 'match',
}

export default function ResultsSection({ results, resumeSummary, fileName, onReset }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showSkills, setShowSkills] = useState(false)

  const filtered = useMemo(() => {
    let list = results.filter(job => {
      if (filters.source !== 'all' && job.source !== filters.source) return false
      if (filters.jobType !== 'all' && job.job_type !== filters.jobType) return false
      if (filters.category !== 'all' && job.category !== filters.category) return false
      if (job.match_percentage < filters.minMatch) return false
      return true
    })

    if (filters.sort === 'match') {
      list = [...list].sort((a, b) => b.match_percentage - a.match_percentage)
    } else if (filters.sort === 'salary') {
      list = [...list].sort((a, b) => {
        const parse = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0
        return parse(b.salary_range) - parse(a.salary_range)
      })
    } else if (filters.sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    }

    return list
  }, [results, filters])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-medium text-slate-600
                     hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Upload New Resume
        </button>

        {resumeSummary && (
          <button
            onClick={() => setShowSkills(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-violet-600
                       hover:text-violet-800 border border-violet-200 rounded-xl px-3 py-1.5
                       hover:bg-violet-50 transition-all"
          >
            <FileText className="w-4 h-4" />
            {showSkills ? 'Hide' : 'View'} Resume Skills
          </button>
        )}
      </div>

      {/* Detected skills panel */}
      {showSkills && resumeSummary && (
        <div className="bg-white border border-violet-200 rounded-2xl p-5 mb-6 animate-slide-up shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 text-sm">Skills Detected from Your Resume</h3>
          <div className="flex flex-wrap gap-2">
            {resumeSummary.skills.map(skill => (
              <span
                key={skill}
                className="text-xs bg-violet-50 text-violet-700 border border-violet-200
                           rounded-full px-2.5 py-1 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          {resumeSummary.detected_titles.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-2">Detected Job Titles</p>
              <div className="flex flex-wrap gap-2">
                {resumeSummary.detected_titles.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats banner */}
      <StatsBar results={results} resumeSummary={resumeSummary} fileName={fileName} />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={results.length}
        filtered={filtered.length}
      />

      {/* Job grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No matches found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-8">
        <p>
          <strong className="text-slate-600">HirePath</strong> — AI-Powered Job Matching ·
          Scanned {results.length} opportunities across LinkedIn, Indeed, Glassdoor, Monster & ZipRecruiter
        </p>
      </div>
    </div>
  )
}
