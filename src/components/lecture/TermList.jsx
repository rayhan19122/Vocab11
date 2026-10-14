import { splitAtTerm } from '../../utils/terms'
import { cn } from '../../utils/cn'
import { SpeakButton } from './SpeakButton'

function Sentence({ sentence, term }) {
  const parts = splitAtTerm(sentence, term)
  return (
    <p className="min-w-0 flex-1 text-[0.95rem] text-muted italic">
      “
      {parts ? (
        <>
          {parts.before}
          <mark className="rounded bg-brand-soft px-0.5 font-semibold text-brand not-italic">{parts.match}</mark>
          {parts.after}
        </>
      ) : (
        sentence
      )}
      ”
    </p>
  )
}

/**
 * Every synonym (or antonym) as a row: the term with a pronunciation button, then an example
 * sentence using it (also with a listen button). Example sentences are written for this app, not taken from the PDF.
 */
export function TermList({ entry, kind }) {
  const antonyms = kind === 'antonyms'
  return (
    <ul className="grid gap-2.5" aria-label={antonyms ? 'Antonyms with examples' : 'Synonyms with examples'}>
      {entry[kind].map((term, index) => {
        const sentence = entry.termExamples?.[term]
        return (
          <li key={term} className={cn('rounded-xl border p-3.5', antonyms ? 'border-line bg-surface-2/60' : 'border-brand/25 bg-brand-soft/50')}>
            <div className="flex items-center gap-2">
              {!antonyms && (
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-lg bg-surface text-xs font-bold text-brand">
                  {index + 1}
                </span>
              )}
              <span className={cn('text-lg font-semibold', !antonyms && 'text-brand')}>{term}</span>
              <SpeakButton text={term} size="sm" />
            </div>
            {sentence && (
              <div className="mt-1.5 flex items-start gap-1.5">
                <Sentence sentence={sentence} term={term} />
                <SpeakButton text={sentence} size="sm" label={`Listen to an example sentence with ${term}`} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Compact version: just the terms, each with a pronunciation button. */
export function TermChips({ entry, kind }) {
  const antonyms = kind === 'antonyms'
  return (
    <ul className="flex flex-wrap gap-2" aria-label={antonyms ? 'Antonyms' : 'Synonyms'}>
      {entry[kind].map((term, index) => (
        <li key={term} className={cn('flex items-center gap-1.5 rounded-xl py-1 pr-1 pl-2 font-semibold', antonyms ? 'bg-surface-2 font-medium text-ink' : 'bg-brand-soft text-brand')}>
          {!antonyms && (
            <span aria-hidden="true" className="grid size-5 place-items-center rounded-md bg-surface text-[11px]">
              {index + 1}
            </span>
          )}
          {term}
          <SpeakButton text={term} size="sm" />
        </li>
      ))}
    </ul>
  )
}
