import { CheckCircle2, XCircle } from 'lucide-react'
import { vocabularyById } from '../../data/vocabulary'
import { cn } from '../../utils/cn'
import { WordDetail } from '../lecture/WordDetail'

function MatchBreakdown({ question }) {
  return (
    <ul className="grid gap-3">
      {question.wordIds.map((id) => {
        const entry = vocabularyById[id]
        return (
          <li key={id} className="rounded-xl bg-surface-2 p-3">
            <p className="font-display text-lg font-bold">{entry.word}</p>
            <p className="text-sm text-muted">{entry.meaning}</p>
            <p className="mt-1 text-sm font-semibold text-brand">{entry.synonyms.join(' · ')}</p>
          </li>
        )
      })}
    </ul>
  )
}

/** Shown after every answer: result, the right answer, and what to learn from it. */
export function AnswerFeedback({ question, correct }) {
  const entry = vocabularyById[question.wordId]
  const answerText = Array.isArray(question.answer) ? question.answer.join(', ') : question.answer
  return (
    <div role="status" aria-live="polite" className={cn('animate-reveal rounded-2xl border-2 p-4 sm:p-5', correct ? 'border-brand/40 bg-brand-soft/50' : 'border-danger/40 bg-danger-soft/50')}>
      <div className="mb-4 flex items-start gap-3">
        {correct ? <CheckCircle2 aria-hidden="true" className="size-6 shrink-0 text-brand" /> : <XCircle aria-hidden="true" className="size-6 shrink-0 text-danger" />}
        <div>
          <p className="font-bold">{correct ? 'Correct!' : 'Not quite'}</p>
          {!correct && answerText && (
            <p className="text-sm">
              Correct answer: <strong>{answerText}</strong>
            </p>
          )}
        </div>
      </div>
      {question.kind === 'synonym-match' ? <MatchBreakdown question={question} /> : <WordDetail entry={entry} showWord />}
    </div>
  )
}
