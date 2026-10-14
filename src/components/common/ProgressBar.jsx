import { cn } from '../../utils/cn'

const TONES = { brand: 'bg-brand', warn: 'bg-warn', danger: 'bg-danger', info: 'bg-info' }

/** Accessible progress bar. `label` describes what is being measured for screen readers. */
export function ProgressBar({ value, max = 100, label, tone = 'brand', size = 'md', className }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn('w-full overflow-hidden rounded-full bg-surface-2', size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONES[tone])} style={{ width: `${percent}%` }} />
    </div>
  )
}
