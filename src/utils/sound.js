// Tiny synthesized sound effects (Web Audio): no audio files, nothing to download.
let context

const TONES = {
  correct: [[660, 0.09], [880, 0.12]],
  wrong: [[220, 0.16]],
  done: [[523, 0.1], [659, 0.1], [784, 0.18]],
}

export function playSound(name, enabled) {
  if (!enabled || typeof window === 'undefined') return
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  try {
    context = context || new AudioContext()
    if (context.state === 'suspended') context.resume()
    let start = context.currentTime
    for (const [frequency, duration] of TONES[name] || []) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = name === 'wrong' ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + duration + 0.02)
      start += duration
    }
  } catch {
    // Audio is optional; ignore any browser restriction.
  }
}
