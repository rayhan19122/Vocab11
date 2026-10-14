import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { lectureLabel } from '../../utils/sources'
import { STATUS_LABELS } from '../../utils/progress'
import { cn } from '../../utils/cn'
import { Badge } from '../common/Badge'
import { ProgressBar } from '../common/ProgressBar'

const STATUS_TONE = { 'not-started': 'neutral', learning: 'warn', 'in-progress': 'info', completed: 'brand' }

/** One lecture as a card. The whole card is a link (via the "Study" link's stretched hit area). */
export function LectureCard({ stats }) {
  const label = lectureLabel(stats.lectureId)
  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-eyebrow">Lecture</p>
          <h3 className="font-display text-3xl leading-none font-bold">{String(stats.lectureId).padStart(2, '0')}</h3>
        </div>
        <Badge tone={STATUS_TONE[stats.status]} icon={stats.status === 'completed' ? Check : undefined}>
          {STATUS_LABELS[stats.status]}
        </Badge>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold">{stats.percent}% complete</span>
          <span className="text-muted">{stats.total} words</span>
        </div>
        <ProgressBar value={stats.percent} label={`${label} progress`} tone={stats.status === 'completed' ? 'brand' : 'brand'} />
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className={cn('flex items-center gap-1.5 text-sm', stats.mastered ? 'font-semibold text-brand' : 'text-muted')}>
          <Sparkles aria-hidden="true" className="size-4" />
          {stats.mastered} mastered
        </p>
        <Link
          to={`/lectures/${stats.lectureId}`}
          className="flex items-center gap-1 text-sm font-bold text-brand after:absolute after:inset-0 after:rounded-2xl"
          aria-label={`Study ${label}`}
        >
          Study
          <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}
