import { MapPin, Briefcase, DollarSign, ExternalLink, Tag } from 'lucide-react'
import CircularProgress from './CircularProgress'

const SOURCE_STYLES = {
  LinkedIn:     'source-badge-linkedin',
  Indeed:       'source-badge-indeed',
  Glassdoor:    'source-badge-glassdoor',
  Monster:      'source-badge-monster',
  ZipRecruiter: 'source-badge-ziprecruiter',
}

const MATCH_LABEL = (pct) => {
  if (pct >= 85) return { label: 'Excellent Match', cls: 'text-green-600 bg-green-50 border-green-200' }
  if (pct >= 70) return { label: 'Strong Match',    cls: 'text-teal-600  bg-teal-50  border-teal-200'  }
  if (pct >= 55) return { label: 'Good Match',      cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  if (pct >= 40) return { label: 'Fair Match',      cls: 'text-amber-600 bg-amber-50 border-amber-200' }
  return { label: 'Partial Match', cls: 'text-red-600 bg-red-50 border-red-200' }
}

export default function JobCard({ job, index }) {
  const { label, cls } = MATCH_LABEL(job.match_percentage)

  return (
    <div
      className="job-card-enter bg-white rounded-2xl border border-slate-100 shadow-sm
                 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full animated-bg`} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Company avatar */}
          <div className="w-10 h-10 rounded-xl animated-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">
              {job.company.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{job.title}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{job.company}</p>
          </div>

          <CircularProgress percentage={job.match_percentage} size={64} />
        </div>

        {/* Match label */}
        <div>
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
            {label}
          </span>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{job.job_type}</span>
            <span className="text-slate-300">•</span>
            <span>{job.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-slate-700">{job.salary_range}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {job.description}
        </p>

        {/* Matching skills */}
        {job.matching_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Tag className="w-3 h-3 text-violet-500" />
              <span className="text-xs font-semibold text-slate-600">Matching Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.matching_skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-violet-50 text-violet-700 border border-violet-200
                             rounded-full px-2 py-0.5 font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.matching_skills.length > 6 && (
                <span className="text-xs text-slate-400">+{job.matching_skills.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SOURCE_STYLES[job.source] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {job.source}
          </span>
          <button
            className="flex items-center gap-1 text-xs font-semibold text-violet-600
                       hover:text-violet-800 transition-colors"
          >
            View Job <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
