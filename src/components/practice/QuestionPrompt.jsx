import { Info } from 'lucide-react'

/** The question text/stimulus for any question kind. */
export function QuestionPrompt({ question }) {
  if (question.kind === 'meaning') {
    return <h2 className="font-display text-2xl leading-snug font-bold sm:text-3xl">{question.prompt}</h2>
  }
  if (question.kind === 'fill-choice' || question.kind === 'fill-type') {
    return (
      <div>
        <p className="t-label mb-3">{question.prompt}</p>
        <p className="font-display text-xl leading-relaxed font-semibold sm:text-2xl">
          {question.before}
          <span className="mx-1 inline-block min-w-24 border-b-4 border-brand text-transparent select-none" aria-label="blank">
            {question.blank}
          </span>
          {question.after}
        </p>
        {question.inflected && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            The word may change form in the sentence (for example an added -s or -ed).
          </p>
        )}
      </div>
    )
  }
  if (question.kind === 'synonym-match') {
    return <h2 className="font-display text-2xl leading-snug font-bold sm:text-3xl">{question.prompt}</h2>
  }
  return (
    <div>
      <p className="t-label mb-2">{question.prompt}</p>
      <h2 className="font-display text-4xl font-bold tracking-tight uppercase sm:text-5xl">{question.target}</h2>
    </div>
  )
}
