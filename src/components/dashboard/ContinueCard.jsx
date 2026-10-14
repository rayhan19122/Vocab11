import { ArrowRight, Play } from 'lucide-react'
import { vocabularyById } from '../../data/vocabulary'
import { lectureLabel } from '../../utils/sources'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { ProgressBar } from '../common/ProgressBar'

export function ContinueCard({ last, stats }) {
  const lectureId = last.lectureId || 1
  const lectureStats = stats[lectureId - 1]
  const word = last.wordId ? vocabularyById[last.wordId] : null
  const started = Boolean(last.lectureId)

  return (
    <Card className="flex h-full flex-col gap-5">
      <div>
        <p className="t-eyebrow mb-1">{started ? 'Continue learning' : 'Start learning'}</p>
        <h2 className="t-h2">{lectureLabel(lectureId)}</h2>
        <p className="mt-1 text-muted">
          {started && word ? (
            <>
              Last studied word: <span className="font-semibold text-ink">{word.word}</span>
            </>
          ) : (
            'Begin with the first lecture and build momentum.'
          )}
        </p>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold">{lectureStats.percent}% complete</span>
          <span className="text-muted">
            {lectureStats.learned} / {lectureStats.total} learned
          </span>
        </div>
        <ProgressBar value={lectureStats.percent} label={`${lectureLabel(lectureId)} progress`} size="lg" />
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button to={`/lectures/${lectureId}`} icon={Play}>
          {started ? 'Continue' : 'Start Lecture 01'}
        </Button>
        <Button to={`/flashcards?source=${lectureId}`} variant="secondary" iconRight={ArrowRight}>
          Flashcards
        </Button>
      </div>
    </Card>
  )
}
