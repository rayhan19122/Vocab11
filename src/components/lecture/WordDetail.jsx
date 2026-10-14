import { Volume2 } from 'lucide-react'
import { useSpeech } from '../../hooks/useSpeech'
import { blankSentence } from '../../utils/fillBlank'
import { cn } from '../../utils/cn'
import { Badge } from '../common/Badge'
import { IconButton } from '../common/Button'

/** The original example sentence with the target word highlighted. */
export function ExampleSentence({ entry, className }) {
  const parts = blankSentence(entry.word, entry.example)
  return (
    <blockquote className={cn('t-quote', className)}>
      “{parts ? <>{parts.before}<mark className="rounded bg-brand-soft px-1 font-semibold text-brand not-italic">{parts.surface}</mark>{parts.after}</> : entry.example}”
    </blockquote>
  )
}

export function SpeakButton({ text, className }) {
  const { supported, speaking, speak } = useSpeech()
  if (!supported) return null
  return <IconButton icon={Volume2} label={`Pronounce ${text}`} pressed={speaking} onClick={() => speak(text)} className={className} />
}

/**
 * Reusable vocabulary detail: meaning, 3 synonyms, antonyms and the original example.
 * `showWord` adds the word as a heading with a pronunciation button.
 */
export function WordDetail({ entry, showWord = false, headingAs: Heading = 'h3', className }) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {showWord && (
        <div className="flex items-center gap-2">
          <Heading className="font-display text-3xl font-bold tracking-tight">{entry.word}</Heading>
          <SpeakButton text={entry.word} />
        </div>
      )}

      <section aria-label="Meaning">
        <p className="t-label mb-1">Meaning</p>
        <p className="text-lg">{entry.meaning}</p>
      </section>

      <section aria-label={entry.related ? 'Related words' : 'Synonyms'}>
        <p className="t-label mb-2 flex items-center gap-2">
          {entry.related ? 'Closest related words' : 'Synonyms'}
          {entry.related && <Badge tone="info">No exact synonym</Badge>}
        </p>
        <ol className="flex flex-wrap gap-2">
          {entry.synonyms.map((synonym, index) => (
            <li key={synonym} className="flex items-center gap-2 rounded-xl bg-brand-soft py-1.5 pr-3.5 pl-2 font-semibold text-brand">
              <span aria-hidden="true" className="grid size-6 place-items-center rounded-lg bg-surface text-xs">
                {index + 1}
              </span>
              {synonym}
            </li>
          ))}
        </ol>
      </section>

      {entry.antonyms.length > 0 && (
        <section aria-label="Antonyms">
          <p className="t-label mb-2">Antonyms</p>
          <ul className="flex flex-wrap gap-2">
            {entry.antonyms.map((antonym) => (
              <li key={antonym} className="rounded-xl bg-surface-2 px-3.5 py-1.5 font-medium">
                {antonym}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Example">
        <p className="t-label mb-2">Example</p>
        <ExampleSentence entry={entry} />
      </section>
    </div>
  )
}
