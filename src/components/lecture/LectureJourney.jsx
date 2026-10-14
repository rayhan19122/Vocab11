import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { STATUS_LABELS } from '../../utils/progress'
import { lectureLabel } from '../../utils/sources'
import { cn } from '../../utils/cn'

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function Ring({ percent, completed }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-12 -rotate-90">
      <circle cx="24" cy="24" r={RADIUS} fill="none" strokeWidth="4" className="stroke-line" />
      <circle
        cx="24"
        cy="24"
        r={RADIUS}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-brand transition-[stroke-dashoffset] duration-700"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - (completed ? 100 : percent) / 100)}
      />
    </svg>
  )
}

/** Lecture 01 → 11 as a path. Each stop shows its ring (progress), status label and a "you are here" marker. */
export function LectureJourney({ stats, currentId }) {
  return (
    <ol className="relative grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-6 lg:grid-cols-11">
      <span aria-hidden="true" className="absolute top-6 right-6 left-6 hidden h-0.5 bg-line lg:block" />
      {stats.map((item) => {
        const completed = item.status === 'completed'
        const label = `${lectureLabel(item.lectureId)}: ${STATUS_LABELS[item.status]}, ${item.percent}% complete, ${item.mastered} mastered`
        return (
          <li key={item.lectureId} className="relative flex justify-center">
            <Link to={`/lectures/${item.lectureId}`} aria-label={label} aria-current={currentId === item.lectureId ? 'step' : undefined} className="group flex flex-col items-center gap-1.5 text-center">
              <span className="relative grid size-12 place-items-center rounded-full bg-surface">
                <Ring percent={item.percent} completed={completed} />
                <span className={cn('absolute inset-0 grid place-items-center text-sm font-bold', completed ? 'text-brand' : 'text-ink')}>
                  {completed ? <Check aria-hidden="true" className="size-5" /> : String(item.lectureId).padStart(2, '0')}
                </span>
                {currentId === item.lectureId && <span aria-hidden="true" className="absolute -inset-1 rounded-full border-2 border-brand/40" />}
              </span>
              <span className="text-xs font-semibold transition group-hover:text-brand">{item.percent}%</span>
              <span className="text-[11px] leading-tight text-muted">{STATUS_LABELS[item.status]}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
