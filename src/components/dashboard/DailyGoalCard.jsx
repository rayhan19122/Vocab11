import { PartyPopper, Target } from 'lucide-react'
import { Card } from '../common/Card'
import { ProgressBar } from '../common/ProgressBar'

export function DailyGoalCard({ today }) {
  const reached = today.done >= today.goal
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="t-eyebrow">Today&apos;s goal</p>
        {reached ? <PartyPopper aria-hidden="true" className="size-5 text-brand" /> : <Target aria-hidden="true" className="size-5 text-brand" />}
      </div>
      <p className="font-display text-4xl leading-none font-bold">
        {today.goal} <span className="text-xl font-semibold text-muted">words</span>
      </p>
      <div>
        <ProgressBar value={today.percent} label="Daily goal progress" size="lg" />
        <div className="mt-2 flex justify-between text-sm">
          <span className="font-semibold">{today.percent}%</span>
          <span className="text-muted">
            {today.done} / {today.goal} completed
          </span>
        </div>
      </div>
      <p className="mt-auto text-sm text-muted">{reached ? 'Goal reached. Every extra word is a bonus.' : 'Each new word you study or answer today counts once.'}</p>
    </Card>
  )
}
