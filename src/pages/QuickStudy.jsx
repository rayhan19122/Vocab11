import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarCheck, ChevronLeft, Clock, Zap } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { buildQuiz } from '../utils/quiz'
import { isWeak, stateRank } from '../utils/spacedRepetition'
import { prioritizedWords } from '../utils/sources'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { QuizResult } from '../components/practice/QuizResult'
import { QuizRunner } from '../components/practice/QuizRunner'
import { usePageTitle } from '../hooks/usePageTitle'

// About two questions a minute, with time to read the feedback.
const SESSIONS = [
  { minutes: 5, questions: 10 },
  { minutes: 10, questions: 20 },
  { minutes: 20, questions: 40 },
  { minutes: 30, questions: 60 },
]
const REVIEW_QUESTIONS = 20

function StudyStats({ summary, improved }) {
  const words = new Set(summary.log.flatMap((item) => item.question.wordIds)).size
  const accuracy = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0
  const stats = [
    ['Words reviewed', words],
    ['Questions answered', summary.total],
    ['Accuracy', `${accuracy}%`],
    ['Words improved', improved],
  ]
  return (
    <dl className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-surface-2 p-3">
          <dt className="text-xs font-semibold text-muted">{label}</dt>
          <dd className="font-display text-2xl font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function QuickStudy() {
  usePageTitle('Quick Study')
  const [params] = useSearchParams()
  const { state } = useProgress()
  const reviewMode = params.get('review') === '1'

  // A session remembers the word records as they were when it started, to measure improvement later.
  const createSession = (questionCount, label) => ({
    id: Date.now(),
    label,
    questionCount,
    before: state.words,
    questions: buildQuiz({ type: 'mixed', pool: prioritizedWords(state, questionCount), count: questionCount }),
  })

  // "Start Review" from the dashboard begins immediately.
  const [session, setSession] = useState(() => (reviewMode ? createSession(REVIEW_QUESTIONS, 'Review session') : null))
  const [summary, setSummary] = useState(null)
  const [improved, setImproved] = useState(0)

  const begin = (questionCount, label) => {
    setSummary(null)
    setSession(createSession(questionCount, label))
  }

  const finish = (result) => {
    const ids = new Set(result.log.flatMap((item) => item.question.wordIds))
    let count = 0
    ids.forEach((id) => {
      const earlier = session.before[id]
      const now = state.words[id]
      const rankUp = stateRank(now?.state) > stateRank(earlier?.state)
      const recovered = isWeak(earlier) && !isWeak(now)
      if (rankUp || recovered) count += 1
    })
    setImproved(count)
    setSummary(result)
  }

  if (summary) {
    return <QuizResult summary={summary} title={session.label} extra={<StudyStats summary={summary} improved={improved} />} onRetry={() => begin(session.questionCount, session.label)} backTo="/" />
  }
  if (session) {
    return <QuizRunner key={session.id} questions={session.questions} mode="mixed" scope={session.label} timed onFinish={finish} onExit={() => setSession(null)} />
  }

  return (
    <>
      <Link to="/practice" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft aria-hidden="true" className="size-4" />
        Practice
      </Link>
      <PageHeader eyebrow="Quick Study" title="How much time do you have?" description="Vocab11 builds a mixed session for you: weak words first, then words due for review, then words you haven't mastered, then random ones." />

      <ul className="grid gap-4 sm:grid-cols-2">
        {SESSIONS.map((item) => (
          <li key={item.minutes}>
            <button
              type="button"
              onClick={() => begin(item.questions, `Quick Study · ${item.minutes} min`)}
              className="group flex w-full items-center gap-5 rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand hover:shadow-pop"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Clock aria-hidden="true" className="size-7" />
              </span>
              <span>
                <span className="block font-display text-3xl leading-none font-bold">{item.minutes} minutes</span>
                <span className="mt-1.5 block text-muted">{item.questions} questions</span>
              </span>
              <Zap aria-hidden="true" className="ml-auto size-5 text-muted transition group-hover:text-brand" />
            </button>
          </li>
        ))}
      </ul>

      <Card className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3">
          <CalendarCheck aria-hidden="true" className="size-5 text-brand" />
          <span>
            <strong>{state.words ? Object.keys(state.words).length : 0}</strong> words studied so far
          </span>
        </p>
        <Button to="/study?review=1" variant="secondary">
          Start a 20-question review
        </Button>
      </Card>
    </>
  )
}
