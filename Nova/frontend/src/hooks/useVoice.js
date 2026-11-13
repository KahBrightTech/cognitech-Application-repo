import { useCallback, useEffect, useRef, useState } from 'react'

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined

/**
 * Wraps the browser Web Speech APIs: dictation in, synthesis out.
 * Degrades to `supported: false` on browsers without them (e.g. Firefox).
 */
export function useVoice({ onTranscript } = {}) {
  const recognitionRef = useRef(null)
  const transcriptHandler = useRef(onTranscript)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [speaking, setSpeaking] = useState(false)

  transcriptHandler.current = onTranscript

  useEffect(() => {
    if (!SpeechRecognition) return undefined

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalText = ''
      let pendingText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else pendingText += result[0].transcript
      }
      setInterim(pendingText)
      if (finalText.trim()) {
        setInterim('')
        transcriptHandler.current?.(finalText.trim())
      }
    }

    recognition.onend = () => {
      setListening(false)
      setInterim('')
    }
    recognition.onerror = () => {
      setListening(false)
      setInterim('')
    }

    recognitionRef.current = recognition
    return () => {
      recognition.onresult = null
      recognition.onend = null
      recognition.onerror = null
      recognition.abort()
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || listening) return
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [listening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.02
    utterance.pitch = 1.05
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return {
    supported: Boolean(SpeechRecognition),
    listening,
    interim,
    speaking,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  }
}
