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
  return { label: 'Partial Match',  cls: 'text-red-600 bg-red-50 border-red-200' }
}

/** Derive a stable hex color from a company name */
const getCompanyBg = (name) => {
  const palette = [
    '4f46e5', '0891b2', '059669', 'd97706', 'dc2626',
    '7c3aed', '0284c7', '16a34a', 'ea580c', 'db2777',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export default function JobCard({ job, index }) {
  const { label, cls } = MATCH_LABEL(job.match_percentage)
  const bg = getCompanyBg(job.company)
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=${bg}&color=fff&size=64&bold=true&rounded=true`

  return (
    <div
      className="job-card-enter bg-white rounded-2xl border border-slate-100 shadow-sm
                 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Accent bar */}
      <div className="h-1.5 w-full animated-bg" />

      <div className="p-5 flex flex-col flex-1 gap-3.5">

        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Company avatar via UI Avatars */}
          <img
            src={avatarUrl}
            alt={job.company}
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl flex-shrink-0 shadow-sm object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'flex')
            }}
          />
          {/* Fallback avatar */}
          <div
            className="w-11 h-11 rounded-xl animated-bg items-center justify-center flex-shrink-0 shadow-sm hidden"
          >
            <span className="text-white font-bold text-sm">{job.company.charAt(0)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-violet-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">{job.company}</p>
          </div>

          <CircularProgress percentage={job.match_percentage} size={60} />
        </div>

        {/* Match badge */}
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${cls}`}>
          {label}
        </span>

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{job.job_type}</span>
            <span className="text-slate-300">•</span>
            <span>{job.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="font-semibold text-slate-700">{job.salary_range}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{job.description}</p>

        {/* Matching skills */}
        {job.matching_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Tag className="w-3 h-3 text-violet-500" />
              <span className="text-xs font-semibold text-slate-600">Matching Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.matching_skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.matching_skills.length > 5 && (
                <span className="text-xs text-slate-400 self-center">+{job.matching_skills.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SOURCE_STYLES[job.source] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {job.source}
          </span>
          <button className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors group/btn">
            View Job
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
