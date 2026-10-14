import { useCallback, useEffect, useRef, useState } from 'react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Browser text-to-speech. No external API: it simply stays unavailable where the browser lacks it. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const active = useRef(false)

  // Only stop speech this button started, so closing one panel never cuts off another button's audio.
  useEffect(
    () => () => {
      if (supported && active.current) window.speechSynthesis.cancel()
    },
    [],
  )

  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    const done = () => {
      active.current = false
      setSpeaking(false)
    }
    utterance.onstart = () => {
      active.current = true
      setSpeaking(true)
    }
    utterance.onend = done
    utterance.onerror = done
    window.speechSynthesis.speak(utterance)
  }, [])

  return { supported, speaking, speak }
}
