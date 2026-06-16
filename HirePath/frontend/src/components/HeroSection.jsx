import { useState, useRef } from 'react'
import { Upload, FileText, Briefcase, Zap, ChevronRight, AlertCircle } from 'lucide-react'

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
    <div className="relative overflow-hidden">
      {/* Animated gradient header */}
      <div className="animated-bg text-white pt-20 pb-32 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold">AI-Powered Resume Matching</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Upload your resume.
            <br />
            <span className="text-yellow-300">Find your perfect match.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            HirePath scans <strong className="text-white">5 major job boards</strong> simultaneously
            and ranks every opportunity by how well it matches your skills and experience.
          </p>

          {/* Source pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {SOURCES.map((s) => (
              <span key={s} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload card overlapping the hero */}
      <div className="relative z-10 -mt-20 max-w-2xl mx-auto px-4 pb-16">
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Your Resume</h2>
          <p className="text-slate-500 text-sm mb-6">Supported formats: <strong>PDF</strong> and <strong>DOCX</strong></p>

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
                  : 'border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50'
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
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-lg">
                    {dragging ? 'Drop it here!' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
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
        </div>

        {/* How it works */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📄', title: 'Upload Resume', desc: 'PDF or DOCX — we extract your skills, experience & education automatically.' },
            { icon: '🔍', title: 'Multi-Board Search', desc: 'We scan LinkedIn, Indeed, Glassdoor, Monster, and ZipRecruiter simultaneously.' },
            { icon: '🎯', title: 'Smart Matching', desc: 'Jobs are ranked by AI match percentage based on your unique profile.' },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
