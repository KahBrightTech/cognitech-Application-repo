import { SlidersHorizontal, X } from 'lucide-react'

const SOURCES = ['LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'ZipRecruiter']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote']
const CATEGORIES = ['Engineering', 'Data Science', 'Product', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Project Management', 'Human Resources', 'Operations', 'Research', 'Education', 'Design']

export default function FilterBar({ filters, setFilters, total, filtered }) {
  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const hasActiveFilters =
    filters.source !== 'all' || filters.jobType !== 'all' ||
    filters.category !== 'all' || filters.minMatch > 0

  const clearAll = () => setFilters({ source: 'all', jobType: 'all', category: 'all', minMatch: 0, sort: 'match' })

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-violet-600" />
          <span className="font-semibold text-slate-700 text-sm">Filter & Sort</span>
          {hasActiveFilters && (
            <span className="bg-violet-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{filtered}</strong> of {total} jobs
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Source */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Job Board</label>
          <select
            value={filters.source}
            onChange={e => setFilter('source', e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="all">All Boards</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Job type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Job Type</label>
          <select
            value={filters.jobType}
            onChange={e => setFilter('jobType', e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="all">All Types</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
          <select
            value={filters.category}
            onChange={e => setFilter('category', e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Min match % */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Min Match: <span className="text-violet-600">{filters.minMatch}%</span>
          </label>
          <input
            type="range"
            min={0} max={90} step={5}
            value={filters.minMatch}
            onChange={e => setFilter('minMatch', Number(e.target.value))}
            className="w-full accent-violet-600"
          />
        </div>
      </div>

      {/* Sort row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-500 self-center">Sort by:</span>
        {[
          { key: 'match', label: 'Best Match' },
          { key: 'salary', label: 'Salary' },
          { key: 'title', label: 'Job Title' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilter('sort', opt.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
              ${filters.sort === opt.key
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
