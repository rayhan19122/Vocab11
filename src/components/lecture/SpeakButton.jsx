import { Volume2 } from 'lucide-react'
import { useSpeech } from '../../hooks/useSpeech'
import { cn } from '../../utils/cn'

const SPEAK_SIZES = { sm: ['size-7', 'size-4'], md: ['size-10', 'size-5'] }

/** Reads `text` aloud with the browser's built-in speech. Hidden where the browser has none. */
export function SpeakButton({ text, label, size = 'md', className }) {
  const { supported, speaking, speak } = useSpeech()
  if (!supported) return null
  const [box, icon] = SPEAK_SIZES[size]
  const name = label || `Pronounce ${text}`
  return (
    <button
      type="button"
      aria-label={name}
      title={name}
      aria-pressed={speaking}
      onClick={() => speak(text)}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg transition hover:bg-surface-2 hover:text-brand active:scale-95',
        box,
        speaking ? 'bg-brand-soft text-brand' : 'text-muted',
        className,
      )}
    >
      <Volume2 aria-hidden="true" className={icon} />
    </button>
  )
}
