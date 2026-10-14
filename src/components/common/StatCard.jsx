import { Card } from './Card'

export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="flex flex-col gap-3 !p-4 sm:!p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="t-label">{label}</span>
        {Icon && <Icon aria-hidden="true" className="size-4 text-brand" />}
      </div>
      <p className="font-display text-3xl leading-none font-bold tracking-tight">{value}</p>
      {hint && <p className="-mt-1 text-sm text-muted">{hint}</p>}
    </Card>
  )
}
