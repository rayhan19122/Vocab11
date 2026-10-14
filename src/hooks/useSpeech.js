import { useCallback, useEffect, useState } from 'react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Browser text-to-speech. No external API: it simply stays unavailable where the browser lacks it. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => supported && window.speechSynthesis.cancel(), [])

  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  return { supported, speaking, speak }
}
