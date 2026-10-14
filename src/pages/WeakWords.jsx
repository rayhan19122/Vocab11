import { useMemo, useState } from 'react'
import { PartyPopper, Play, Target } from 'lucide-react'
import { vocabulary, lectures } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { formatRelativeDay } from '../utils/date'
import { isWeak, wordAccuracy, WEAK_RECOVERY } from '../utils/spacedRepetition'
import { lectureLabel } from '../utils/sources'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { SelectField } from '../components/common/Field'
import { PageHeader } from '../components/common/PageHeader'
import { ProgressBar } from '../components/common/ProgressBar'
import { StateBadge } from '../components/lecture/WordBadges'
import { usePageTitle } from '../hooks/usePageTitle'

const SORTS = [
  { value: 'accuracy', label: 'Lowest accuracy' },
  { value: 'mistakes', label: 'Most mistakes' },
  { value: 'recent', label: 'Most recently missed' },
]

export default function WeakWords() {
  usePageTitle('Weak Words')
  const { state } = useProgress()
  const [lecture, setLecture] = useState('all')
  const [sort, setSort] = useState('accuracy')

  const weak = useMemo(
    () =>
      vocabulary
        .filter((item) => isWeak(state.words[item.id]))
        .map((item) => ({ item, record: state.words[item.id] }))
        .filter(({ item }) => lecture === 'all' || item.lecture === Number(lecture)),
    [state.words, lecture],
  )
  const sorted = useMemo(() => {
    const copy = [...weak]
    if (sort === 'mistakes') return copy.sort((a, b) => b.record.wrong - a.record.wrong)
    if (sort === 'recent') return copy.sort((a, b) => String(b.record.lastReviewed).localeCompare(String(a.record.lastReviewed)))
    return copy.sort((a, b) => wordAccuracy(a.record) - wordAccuracy(b.record) || b.record.wrong - a.record.wrong)
  }, [weak, sort])

  const lectureOptions = [{ value: 'all', label: 'All lectures' }, ...lectures.map((l) => ({ value: String(l.id), label: lectureLabel(l.id) }))]

  return (
    <>
      <PageHeader
        eyebrow="Weak words"
        title="Weak Words"
        description={`Words you have missed. A word leaves this list after ${WEAK_RECOVERY} correct answers in a row.`}
        actions={
          weak.length > 0 && (
            <Button to="/practice/mixed?source=weak" size="lg" icon={Play}>
              Practice all weak words
            </Button>
          )
        }
      />

      {weak.length === 0 && lecture === 'all' ? (
        <EmptyState icon={PartyPopper} title="No weak words" action={<Button to="/practice">Go to practice</Button>}>
          Words you answer incorrectly will appear here so you can fix them quickly.
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
            <SelectField label="Lecture" value={lecture} onChange={(event) => setLecture(event.target.value)} options={lectureOptions} />
            <SelectField label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} options={SORTS} />
          </div>
          <p className="mb-4 text-sm text-muted" role="status">
            {sorted.length} weak {sorted.length === 1 ? 'word' : 'words'}
          </p>
          {sorted.length === 0 ? (
            <EmptyState icon={Target} title="No weak words in this lecture">
              Pick another lecture, or choose all lectures.
            </EmptyState>
          ) : (
            <ul className="grid gap-3">
              {sorted.map(({ item, record }) => {
                const accuracy = wordAccuracy(record)
                const attempts = record.correct + record.wrong
                return (
                  <li key={item.id}>
                    <Card className="flex flex-col gap-4 !p-4 sm:flex-row sm:items-center sm:!p-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-2xl font-bold">{item.word}</h2>
                          <Badge>{lectureLabel(item.lecture)}</Badge>
                          <StateBadge state={record.state} />
                        </div>
                        <p className="mt-1 text-muted">{item.synonyms.join(' · ')}</p>
                        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          <div className="flex gap-1.5">
                            <dt className="text-muted">Mistakes</dt>
                            <dd className="font-semibold">{record.wrong}</dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted">Practised</dt>
                            <dd className="font-semibold">{attempts}×</dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted">Last</dt>
                            <dd className="font-semibold">{formatRelativeDay(record.lastReviewed)}</dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted">Streak</dt>
                            <dd className="font-semibold">
                              {record.streak}/{WEAK_RECOVERY}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div className="flex items-center gap-4 sm:w-64">
                        <div className="flex-1">
                          <p className="mb-1.5 flex justify-between text-sm font-semibold">
                            <span>Accuracy</span>
                            <span>{accuracy}%</span>
                          </p>
                          <ProgressBar value={accuracy} label={`${item.word} accuracy`} tone={accuracy < 50 ? 'danger' : 'warn'} />
                        </div>
                        <Button to={`/practice/mixed?word=${item.id}`} variant="secondary" size="sm">
                          Practice
                        </Button>
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </>
  )
}
