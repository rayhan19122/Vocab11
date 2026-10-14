import { vocabulary, lectures } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { lectureStats } from '../utils/progress'
import { Card, SectionHeader } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { LectureCard } from '../components/lecture/LectureCard'
import { LectureJourney } from '../components/lecture/LectureJourney'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Lectures() {
  usePageTitle('Lectures')
  const { state } = useProgress()
  const stats = lectures.map((lecture) => lectureStats(state, vocabulary, lecture.id))
  const completed = stats.filter((item) => item.status === 'completed').length

  return (
    <>
      <PageHeader eyebrow="Library" title="Lectures" description="Eleven lectures, 25 words each. Pick one and learn every word with its 3 synonyms." />

      <Card className="mb-8">
        <SectionHeader eyebrow="Lecture journey" title={`${completed} of 11 completed`} className="mb-6" />
        <LectureJourney stats={stats} currentId={state.last.lectureId} />
      </Card>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <li key={item.lectureId}>
            <LectureCard stats={item} />
          </li>
        ))}
      </ul>
    </>
  )
}
