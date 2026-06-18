import { useState, useRef } from 'react'
import {
  Upload, FileText, Briefcase, Zap, ChevronRight,
  AlertCircle, Users, Star, TrendingUp, Shield, Globe,
} from 'lucide-react'

const SOURCES = ['LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'ZipRecruiter']

export default function HeroSection({ onUpload, error }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSet(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) validateAndSet(file)
  }

  const validateAndSet = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      alert('Please upload a PDF or DOCX file.')
      return
    }
    setSelectedFile(file)
  }

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile)
  }

  return (
    <div>
      {/* ──────────────────────────── HERO ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="hero-grid-pattern absolute inset-0 opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Headline & stats */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold">AI-Powered Resume Matching</span>
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
                Land your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-yellow-400 pb-2">
                  dream job
                </span>
                faster than ever
              </h1>

              <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg">
                Upload your resume and let our AI scan{' '}
                <strong className="text-white">5 major job boards</strong>{' '}
                simultaneously — ranking every opportunity by how well it matches your unique skills.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 mb-10">
                {[
                  { label: 'Jobs Matched',   value: '50K+', icon: <Briefcase className="w-4 h-4" /> },
                  { label: 'Job Boards',     value: '5',    icon: <Globe     className="w-4 h-4" /> },
                  { label: 'Match Accuracy', value: '94%',  icon: <Star      className="w-4 h-4" /> },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-violet-300">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold">{stat.value}</div>
                      <div className="text-xs text-white/50">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Job board pills */}
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(s => (
                  <span
                    key={s}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Hero image + floating cards */}
            <div className="relative hidden lg:block">
              {/* Hero image */}
              <div className="relative rounded-3xl overflow-visible shadow-2xl shadow-violet-900/50">
                <div className="rounded-3xl overflow-hidden border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80"
                    alt="Professional using HirePath"
                    className="w-full h-[480px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-950/70 via-transparent to-transparent rounded-3xl" />
                </div>

                {/* Floating: Top Match */}
                <div className="absolute -top-5 -right-6 bg-white rounded-2xl px-5 py-4 shadow-2xl border border-slate-100 float-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Top Match</div>
                      <div className="text-2xl font-extrabold text-slate-800">92%</div>
                    </div>
                  </div>
                </div>

                {/* Floating: Jobs Found */}
                <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-5 py-4 shadow-2xl border border-slate-100 float-card" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Jobs Found</div>
                      <div className="text-2xl font-extrabold text-slate-800">24 Matches</div>
                    </div>
                  </div>
                </div>

                {/* Floating: AI Score */}
                <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-100 float-card" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-xs text-slate-400">AI Score</div>
                      <div className="font-extrabold text-slate-800">Excellent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── UPLOAD ──────────────────────────── */}
      <section id="upload" className="bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Get Started Now</h2>
            <p className="text-slate-500">Upload your resume and discover jobs perfectly matched to your skills</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                transition-all duration-200
                ${dragging
                  ? 'border-violet-500 bg-violet-50 scale-[1.01]'
                  : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50'
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700 text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to upload
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                    className="text-xs text-slate-400 hover:text-red-500 underline transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mb-2">
                    <Upload className="w-10 h-10 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-xl">
                      {dragging ? 'Drop it here!' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Supports <strong>PDF</strong> and <strong>DOCX</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className={`
                mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                text-base font-bold transition-all duration-200
                ${selectedFile
                  ? 'btn-primary'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Briefcase className="w-5 h-5" />
              Analyze & Match Jobs
              {selectedFile && <ChevronRight className="w-5 h-5" />}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              Your resume is processed securely and never stored permanently
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── HOW IT WORKS ──────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">How HirePath Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Three simple steps to find your perfect job match</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01', emoji: '📄',
                title: 'Upload Your Resume',
                desc: 'Upload your PDF or DOCX resume. Our AI instantly extracts your skills, experience, education, and career history.',
                img: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&w=500&q=80',
                gradient: 'from-violet-500 to-violet-700',
              },
              {
                step: '02', emoji: '🔍',
                title: 'Multi-Board Search',
                desc: 'We scan LinkedIn, Indeed, Glassdoor, Monster, and ZipRecruiter simultaneously — thousands of fresh job listings.',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80',
                gradient: 'from-indigo-500 to-indigo-700',
              },
              {
                step: '03', emoji: '🎯',
                title: 'Get Ranked Matches',
                desc: 'Jobs are ranked by AI match percentage based on your unique profile — so you apply smarter, not harder.',
                img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=500&q=80',
                gradient: 'from-cyan-500 to-cyan-700',
              },
            ].map((step) => (
              <div
                key={step.step}
                className="group rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-75`} />
                  <div className="absolute top-4 left-4 text-4xl drop-shadow">{step.emoji}</div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1 border border-white/30">
                    <span className="text-white font-black text-xl">{step.step}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── JOB BOARDS STRIP ──────────────────────────── */}
      <section className="bg-slate-50 py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            We scan jobs from all major boards
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'LinkedIn',     bg: 'bg-blue-600',   hover: 'hover:bg-blue-700'   },
              { name: 'Indeed',       bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700' },
              { name: 'Glassdoor',    bg: 'bg-green-600',  hover: 'hover:bg-green-700'  },
              { name: 'Monster',      bg: 'bg-purple-600', hover: 'hover:bg-purple-700' },
              { name: 'ZipRecruiter', bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
            ].map(board => (
              <div
                key={board.name}
                className={`${board.bg} ${board.hover} text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-lg transition-all duration-200 cursor-default select-none`}
              >
                {board.name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
