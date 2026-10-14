import { cn } from '../../utils/cn'

export function Card({ as: Tag = 'div', className, padded = true, ...props }) {
  return <Tag className={cn('rounded-2xl border border-line bg-surface shadow-card', padded && 'p-5 sm:p-6', className)} {...props} />
}

export function SectionHeader({ title, eyebrow, action, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow mb-1">{eyebrow}</p>}
        <h2 className="t-h2">{title}</h2>
      </div>
      {action}
    </div>
  )
}
