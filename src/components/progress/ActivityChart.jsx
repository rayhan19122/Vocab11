import { useState } from 'react'
import { addDays, dayKey } from '../../utils/date'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Answers per day for the last 7 days: plain bars with the number printed above, so nothing relies on colour. */
export function ActivityChart({ days }) {
  const [today] = useState(() => new Date())
  const series = Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(today, offset - 6)
    const entry = days[dayKey(date)]
    return { label: WEEKDAYS[date.getDay()], answered: entry?.answered || 0, words: entry?.words || 0 }
  })
  const max = Math.max(1, ...series.map((item) => item.answered))
  return (
    <ol className="grid grid-cols-7 items-end gap-2 sm:gap-4" aria-label="Answers per day over the last 7 days">
      {series.map((item, index) => (
        <li key={index} className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold tabular-nums">{item.answered}</span>
          <div className="flex h-28 w-full items-end rounded-lg bg-surface-2">
            <div className="w-full rounded-lg bg-brand transition-[height] duration-500" style={{ height: `${(item.answered / max) * 100}%`, minHeight: item.answered ? 6 : 0 }} />
          </div>
          <span className="text-xs text-muted">{index === 6 ? 'Today' : item.label}</span>
        </li>
      ))}
    </ol>
  )
}
