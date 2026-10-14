import { blankSentence } from '../../utils/fillBlank'
import { cn } from '../../utils/cn'
import { Badge } from '../common/Badge'
import { SpeakButton } from './SpeakButton'
import { TermChips, TermList } from './TermList'

/** The original example sentence with the target word highlighted. */
export function ExampleSentence({ entry, className }) {
  const parts = blankSentence(entry.word, entry.example)
  return (
    <blockquote className={cn('t-quote', className)}>
      “{parts ? <>{parts.before}<mark className="rounded bg-brand-soft px-1 font-semibold text-brand not-italic">{parts.surface}</mark>{parts.after}</> : entry.example}”
    </blockquote>
  )
}

/**
 * Reusable vocabulary detail: meaning, 3 synonyms and antonyms (each with a pronunciation button and
 * an example sentence) and the original example from the PDF.
 * `showWord` adds the word as a heading with a pronunciation button.
 * `compact` shows the terms as chips and tucks their example sentences behind a toggle.
 */
export function WordDetail({ entry, showWord = false, compact = false, headingAs: Heading = 'h3', className }) {
  const hasAntonyms = entry.antonyms.length > 0
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

      {compact ? (
        <>
          <section aria-label={entry.related ? 'Related words' : 'Synonyms'}>
            <p className="t-label mb-2 flex items-center gap-2">
              {entry.related ? 'Closest related words' : 'Synonyms'}
              {entry.related && <Badge tone="info">No exact synonym</Badge>}
            </p>
            <TermChips entry={entry} kind="synonyms" />
          </section>
          {hasAntonyms && (
            <section aria-label="Antonyms">
              <p className="t-label mb-2">Antonyms</p>
              <TermChips entry={entry} kind="antonyms" />
            </section>
          )}
          <details className="group rounded-xl border border-line bg-surface px-4 py-3">
            <summary className="cursor-pointer font-semibold text-brand">Show example sentences</summary>
            <div className="mt-4 flex flex-col gap-5">
              <TermList entry={entry} kind="synonyms" />
              {hasAntonyms && <TermList entry={entry} kind="antonyms" />}
            </div>
          </details>
        </>
      ) : (
        <>
          <section aria-label={entry.related ? 'Related words' : 'Synonyms'}>
            <p className="t-label mb-2 flex items-center gap-2">
              {entry.related ? 'Closest related words' : 'Synonyms'}
              {entry.related && <Badge tone="info">No exact synonym</Badge>}
            </p>
            <TermList entry={entry} kind="synonyms" />
          </section>
          {hasAntonyms && (
            <section aria-label="Antonyms">
              <p className="t-label mb-2">Antonyms</p>
              <TermList entry={entry} kind="antonyms" />
            </section>
          )}
        </>
      )}

      <section aria-label="Example from the lecture">
        <p className="t-label mb-2">Example from the lecture</p>
        <ExampleSentence entry={entry} />
      </section>
    </div>
  )
}
