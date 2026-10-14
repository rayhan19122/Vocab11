import { CalendarCheck, Zap } from 'lucide-react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

/** Words due for review + the prominent Quick Study entry point. */
export function ReviewCard({ dueCount, weakCount }) {
  return (
    <Card className="relative overflow-hidden !border-transparent !bg-brand text-on-brand">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-on-brand/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-on-brand/15">
            <CalendarCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl leading-tight font-bold">
              {dueCount > 0 ? `${dueCount} ${dueCount === 1 ? 'word' : 'words'} due for review` : 'Nothing due right now'}
            </p>
            <p className="mt-1 text-on-brand/80">
              {weakCount > 0 ? `${weakCount} weak ${weakCount === 1 ? 'word needs' : 'words need'} attention too.` : 'Keep your streak going with a quick session.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {dueCount > 0 && (
            <Button to="/study?review=1" variant="secondary" className="!border-transparent">
              Start Review
            </Button>
          )}
          <Button to="/study" icon={Zap} className="!bg-on-brand !text-brand hover:brightness-95">
            Quick Study
          </Button>
        </div>
      </div>
    </Card>
  )
}
