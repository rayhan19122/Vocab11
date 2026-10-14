import { BookOpenCheck, CheckCheck, Flame, Library, Percent } from 'lucide-react'
import { vocabulary, lectures } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { greeting } from '../utils/date'
import { lectureStats } from '../utils/progress'
import { SectionHeader } from '../components/common/Card'
import { StatCard } from '../components/common/StatCard'
import { ContinueCard } from '../components/dashboard/ContinueCard'
import { DailyGoalCard } from '../components/dashboard/DailyGoalCard'
import { QuickPractice } from '../components/dashboard/QuickPractice'
import { ReviewCard } from '../components/dashboard/ReviewCard'
import { LectureCard } from '../components/lecture/LectureCard'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { state, derived } = useProgress()
  const { overall, today } = derived
  const stats = lectures.map((lecture) => lectureStats(state, vocabulary, lecture.id))

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="t-display">
          {greeting()}, {state.settings.name} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-lg text-muted">Ready to sharpen your vocabulary?</p>
      </header>

      <ReviewCard dueCount={overall.due} weakCount={overall.weak} />

      <section aria-label="Statistics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard icon={Library} label="Total words" value={overall.total} />
        <StatCard icon={BookOpenCheck} label="Learned" value={overall.learned} />
        <StatCard icon={CheckCheck} label="Mastered" value={overall.mastered} />
        <StatCard icon={Percent} label="Accuracy" value={overall.accuracy === null ? '—' : `${overall.accuracy}%`} hint={overall.answered ? `${overall.answered} answers` : 'No answers yet'} />
        <div className="col-span-2 lg:col-span-1">
          <StatCard icon={Flame} label="Streak" value={`${derived.streak}d`} hint={derived.streak ? 'Keep it going' : 'Study today to start'} />
        </div>
      </section>

      <section aria-label="Today" className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContinueCard last={state.last} stats={stats} />
        </div>
        <DailyGoalCard today={today} />
      </section>

      <section aria-label="Lecture progress">
        <SectionHeader title="Lecture progress" eyebrow="11 lectures" className="mb-4" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((item) => (
            <li key={item.lectureId}>
              <LectureCard stats={item} />
            </li>
          ))}
        </ul>
      </section>

      <QuickPractice />
    </div>
  )
}
