import { BookOpenCheck, CheckCheck, CircleDashed, Percent, XCircle, Library } from 'lucide-react'
import { vocabulary, lectures } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { formatRelativeDay } from '../utils/date'
import { lectureStats, mostMissed, mostPracticed } from '../utils/progress'
import { lectureLabel } from '../utils/sources'
import { MODE_LABELS } from '../utils/quiz'
import { Badge } from '../components/common/Badge'
import { Card, SectionHeader } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { ProgressBar } from '../components/common/ProgressBar'
import { StatCard } from '../components/common/StatCard'
import { ActivityChart } from '../components/progress/ActivityChart'
import { WordRankList } from '../components/progress/WordRankList'
import { usePageTitle } from '../hooks/usePageTitle'

function extremes(stats) {
  const started = stats.filter((item) => item.touched > 0)
  if (started.length === 0) return { strongest: null, weakest: null }
  const byStrength = [...started].sort((a, b) => b.percent - a.percent || (b.accuracy ?? 0) - (a.accuracy ?? 0))
  return {
    strongest: byStrength[0],
    weakest: started.length > 1 ? byStrength[byStrength.length - 1] : null,
  }
}

export default function Progress() {
  usePageTitle('Progress')
  const { state, derived } = useProgress()
  const { overall } = derived
  const stats = lectures.map((lecture) => lectureStats(state, vocabulary, lecture.id))
  const { strongest, weakest } = extremes(stats)
  const practiced = mostPracticed(state, vocabulary)
  const missed = mostMissed(state, vocabulary)
  const hasActivity = overall.answered > 0 || overall.learned > 0

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Progress" description="See how far you have come across all 11 lectures." />

      <section aria-label="Overall" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard icon={Library} label="Total words" value={overall.total} />
        <StatCard icon={BookOpenCheck} label="Learned" value={overall.learned} />
        <StatCard icon={CheckCheck} label="Mastered" value={overall.mastered} />
        <StatCard icon={CircleDashed} label="Remaining" value={overall.remaining} />
        <div className="col-span-2 lg:col-span-1">
          <StatCard icon={Percent} label="Accuracy" value={overall.accuracy === null ? '—' : `${overall.accuracy}%`} />
        </div>
      </section>

      {!hasActivity && (
        <EmptyState className="mb-6" icon={BookOpenCheck} title="Your progress will appear here">
          Study a few flashcards or answer a quiz and your numbers will show up.
        </EmptyState>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Lecture by lecture" eyebrow="Learned words per lecture" className="mb-5" />
          <ul className="grid gap-4">
            {stats.map((item) => (
              <li key={item.lectureId} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 sm:grid-cols-[6.5rem_1fr_auto]">
                <span className="text-sm font-semibold">{lectureLabel(item.lectureId)}</span>
                <ProgressBar value={item.percent} label={`${lectureLabel(item.lectureId)} progress`} />
                <span className="w-24 text-right text-sm">
                  <strong>{item.percent}%</strong>
                  <span className="text-muted"> · {item.mastered}★</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">★ = mastered words. Percentage = learned (review + mastered) of 25.</p>
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <SectionHeader title="Questions" className="mb-4" />
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs font-semibold text-muted">Answered</dt>
                <dd className="font-display text-2xl font-bold">{overall.answered}</dd>
              </div>
              <div className="rounded-xl bg-brand-soft p-3">
                <dt className="text-xs font-semibold text-brand">Correct</dt>
                <dd className="font-display text-2xl font-bold text-brand">{overall.correct}</dd>
              </div>
              <div className="rounded-xl bg-danger-soft p-3">
                <dt className="flex items-center justify-center gap-1 text-xs font-semibold text-danger">
                  <XCircle aria-hidden="true" className="size-3" />
                  Incorrect
                </dt>
                <dd className="font-display text-2xl font-bold text-danger">{overall.wrong}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <SectionHeader title="Strongest & weakest" className="mb-4" />
            <dl className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Strongest lecture</dt>
                <dd>{strongest ? <Badge tone="brand">{lectureLabel(strongest.lectureId)} · {strongest.percent}%</Badge> : '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Weakest lecture</dt>
                <dd>{weakest ? <Badge tone="warn">{lectureLabel(weakest.lectureId)} · {weakest.percent}%</Badge> : '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <SectionHeader title="Last 7 days" eyebrow="Answers per day" className="mb-5" />
          <ActivityChart days={state.days} />
        </Card>

        <Card>
          <SectionHeader title="Most practiced" className="mb-3" />
          <WordRankList rows={practiced} empty="No practice yet." metric={(record) => `${record.correct + record.wrong}×`} />
        </Card>
        <Card>
          <SectionHeader title="Most missed" className="mb-3" />
          <WordRankList rows={missed} empty="No mistakes yet. Great!" metric={(record, accuracy) => `${record.wrong} missed · ${accuracy}%`} />
        </Card>
        <Card>
          <SectionHeader title="Recent quizzes" className="mb-3" />
          {state.history.length === 0 ? (
            <p className="text-muted">No quizzes completed yet.</p>
          ) : (
            <ol className="divide-y divide-line">
              {state.history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="py-2.5">
                  <p className="flex items-center justify-between gap-2 font-semibold">
                    <span className="truncate">{MODE_LABELS[entry.mode] || 'Quiz'}</span>
                    <span>
                      {entry.correct}/{entry.total}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">
                    {entry.scope} · {formatRelativeDay(entry.date)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  )
}
