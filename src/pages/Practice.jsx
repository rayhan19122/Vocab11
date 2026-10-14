import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronLeft, Zap } from 'lucide-react'
import { vocabularyById } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { buildQuiz, canBlank, hasAntonyms, MODES } from '../utils/quiz'
import { parseSource, SOURCE_ALL, sourceLabel, wordsForSource } from '../utils/sources'
import { PageHeader } from '../components/common/PageHeader'
import { cn } from '../utils/cn'
import { MODE_INFO, MODE_ORDER } from '../components/practice/modes'
import { PracticeSetup } from '../components/practice/PracticeSetup'
import { QuizResult } from '../components/practice/QuizResult'
import { QuizRunner } from '../components/practice/QuizRunner'
import { usePageTitle } from '../hooks/usePageTitle'

function PracticeHub() {
  usePageTitle('Practice')
  const [params] = useSearchParams()
  const query = params.get('source') ? `?source=${params.get('source')}` : ''
  return (
    <>
      <PageHeader eyebrow="Practice" title="Practice" description="Choose how you want to be tested. Every answer updates your weak words and review schedule." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODE_ORDER.map((id) => {
          const info = MODE_INFO[id]
          return (
            <li key={id} className={cn(info.featured && 'sm:col-span-2 lg:col-span-2')}>
              <Link
                to={`/practice/${id}${query}`}
                className={cn(
                  'group flex h-full flex-col gap-4 rounded-2xl border p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop sm:p-6',
                  info.featured ? 'border-transparent bg-brand text-on-brand' : 'border-line bg-surface hover:border-line-strong',
                )}
              >
                <span className={cn('grid size-12 place-items-center rounded-2xl', info.featured ? 'bg-on-brand/15' : 'bg-brand-soft text-brand')}>
                  <info.icon aria-hidden="true" className="size-6" />
                </span>
                <span>
                  <span className="mb-1 flex items-center gap-2 font-display text-xl font-bold">
                    {info.title}
                    {info.featured && <span className="rounded-full bg-on-brand/20 px-2 py-0.5 font-sans text-xs font-bold">Most important</span>}
                  </span>
                  <span className={cn('block', info.featured ? 'text-on-brand/85' : 'text-muted')}>{info.description}</span>
                </span>
                <span className="mt-auto flex items-center gap-1 text-sm font-bold">
                  Choose
                  <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          )
        })}
        <li>
          <Link to="/study" className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop sm:p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-warn-soft text-warn">
              <Zap aria-hidden="true" className="size-6" />
            </span>
            <span>
              <span className="mb-1 block font-display text-xl font-bold">Quick Study</span>
              <span className="block text-muted">Pick 5–30 minutes and let Vocab11 choose the words you need most.</span>
            </span>
            <span className="mt-auto flex items-center gap-1 text-sm font-bold">
              Start
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
        </li>
      </ul>
    </>
  )
}

function eligibleWords(mode, pool) {
  if (mode === 'antonym') return pool.filter(hasAntonyms)
  if (mode === 'fill') return pool.filter(canBlank)
  return pool
}

function PracticeMode({ mode }) {
  const [params] = useSearchParams()
  const { state } = useProgress()
  const info = MODE_INFO[mode]
  usePageTitle(info.title)
  const focusWord = vocabularyById[params.get('word')]

  const [config, setConfig] = useState({
    source: parseSource(params.get('source'), state.last.lectureId || SOURCE_ALL),
    count: 10,
    style: 'mixed',
    fillMode: 'choice',
    timed: false,
  })

  const makeSession = (settings, pool) => {
    const questions = buildQuiz({ type: mode, pool: eligibleWords(mode, pool), count: settings.count, synonymStyle: settings.style, fillMode: settings.fillMode })
    return questions.length ? { id: Date.now(), questions, scope: `${sourceLabel(settings.source)} · ${info.title}`, timed: settings.timed } : null
  }

  // "Practice this word" links jump straight into a short quiz on that single word.
  const [session, setSession] = useState(() => (focusWord ? makeSession({ ...config, count: 5 }, [focusWord]) : null))
  const [summary, setSummary] = useState(null)

  const pool = focusWord ? [focusWord] : wordsForSource(config.source, state)
  const available = eligibleWords(mode, pool).length

  const start = () => {
    setSummary(null)
    setSession(makeSession(config, pool))
  }
  const leave = () => {
    setSession(null)
    setSummary(null)
  }

  if (summary) {
    return <QuizResult summary={summary} title={session.scope} onRetry={start} backTo="/practice" />
  }
  if (session) {
    return <QuizRunner key={session.id} questions={session.questions} mode={mode} scope={session.scope} timed={session.timed} onFinish={setSummary} onExit={leave} />
  }

  return (
    <>
      <Link to="/practice" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft aria-hidden="true" className="size-4" />
        All practice modes
      </Link>
      <PageHeader eyebrow="Practice" title={info.title} description={info.description} />
      <PracticeSetup mode={mode} config={config} onChange={setConfig} available={available} onStart={start} />
    </>
  )
}

export default function Practice() {
  const { mode } = useParams()
  if (!mode) return <PracticeHub />
  if (!MODES.includes(mode)) return <Navigate to="/practice" replace />
  return <PracticeMode key={mode} mode={mode} />
}
