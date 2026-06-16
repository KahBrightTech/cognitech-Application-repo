import { useState } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import SearchingAnimation from './components/SearchingAnimation'
import ResultsSection from './components/ResultsSection'

export default function App() {
  const [view, setView] = useState('upload')          // 'upload' | 'searching' | 'results'
  const [results, setResults] = useState(null)
  const [resumeSummary, setResumeSummary] = useState(null)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleUpload = async (file) => {
    setError(null)
    setFileName(file.name)
    setView('searching')

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Give the searching animation time to play (min 3.5s)
      const [response] = await Promise.all([
        fetch('/api/upload', { method: 'POST', body: formData }),
        new Promise(r => setTimeout(r, 3500)),
      ])

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Upload failed')
      }

      const data = await response.json()
      setResults(data.matches)
      setResumeSummary(data.resume_summary)
      setView('results')
    } catch (err) {
      setError(err.message)
      setView('upload')
    }
  }

  const handleReset = () => {
    setView('upload')
    setResults(null)
    setResumeSummary(null)
    setError(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogoClick={handleReset} />

      {view === 'upload' && (
        <HeroSection onUpload={handleUpload} error={error} />
      )}

      {view === 'searching' && (
        <SearchingAnimation fileName={fileName} />
      )}

      {view === 'results' && results && (
        <ResultsSection
          results={results}
          resumeSummary={resumeSummary}
          fileName={fileName}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
