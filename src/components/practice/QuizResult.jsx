import { useState } from 'react'
import { ListChecks, RotateCcw, Target, Trophy } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { AnswerFeedback } from './AnswerFeedback'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function verdict(percent) {
  if (percent >= 90) return 'Outstanding'
  if (percent >= 70) return 'Great work'
  if (percent >= 50) return 'Good effort'
  return 'Keep going'
}

/** End-of-quiz screen: big score, breakdown, and next steps. */
export function QuizResult({ summary, title = 'Quiz complete', onRetry, extra, backTo = '/practice' }) {
  const { derived } = useProgress()
  const [reviewing, setReviewing] = useState(false)
  const { total, correct, log } = summary
  const percent = total ? Math.round((correct / total) * 100) : 0
  const mistakes = log.filter((item) => !item.correct)
  const weakCount = derived.weakIds.length

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="animate-pop text-center !p-6 sm:!p-10">
        <p className="t-eyebrow">{title}</p>
        <h1 className="t-h1 mt-1">
          Quiz complete <span aria-hidden="true">🎉</span>
        </h1>

        <div className="relative mx-auto my-8 size-44">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" className="stroke-surface-2" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className="stroke-brand"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center">
            <p className="font-display text-5xl leading-none font-bold">{percent}%</p>
            <p className="mt-1 text-sm font-semibold text-muted">{verdict(percent)}</p>
          </div>
        </div>

        <p className="font-display text-4xl font-bold">
          {correct} / {total}
        </p>
        <dl className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-soft p-3">
            <dt className="text-xs font-semibold text-brand">Correct</dt>
            <dd className="font-display text-2xl font-bold text-brand">{correct}</dd>
          </div>
          <div className="rounded-xl bg-danger-soft p-3">
            <dt className="text-xs font-semibold text-danger">Incorrect</dt>
            <dd className="font-display text-2xl font-bold text-danger">{total - correct}</dd>
          </div>
        </dl>

        {extra}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="secondary" icon={ListChecks} onClick={() => setReviewing((value) => !value)} disabled={mistakes.length === 0} aria-expanded={reviewing}>
            {mistakes.length ? `${reviewing ? 'Hide' : 'Review'} mistakes (${mistakes.length})` : 'No mistakes to review'}
          </Button>
          <Button variant="secondary" icon={Target} to="/practice/mixed?source=weak" disabled={weakCount === 0}>
            Practice weak words
          </Button>
          {onRetry && (
            <Button icon={RotateCcw} onClick={onRetry}>
              Retry quiz
            </Button>
          )}
        </div>
        <Button to={backTo} variant="ghost" icon={Trophy} className="mt-3">
          Back to practice
        </Button>
      </Card>

      {reviewing && (
        <section aria-label="Mistakes" className="mt-6 flex animate-reveal flex-col gap-4">
          {mistakes.map((item) => (
            <Card key={item.question.id} className="!p-4 sm:!p-5">
              <AnswerFeedback question={item.question} correct={false} />
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
