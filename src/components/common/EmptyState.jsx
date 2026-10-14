import { cn } from '../../utils/cn'

export function EmptyState({ icon: Icon, title, children, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      )}
      <h2 className="t-h3 text-lg">{title}</h2>
      {children && <p className="mt-1.5 max-w-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
