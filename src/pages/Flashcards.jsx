import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layers, Shuffle } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { parseSource, SOURCE_ALL, sourceLabel, wordsForSource } from '../utils/sources'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck'
import { SourceSelect } from '../components/practice/SourceSelect'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Flashcards() {
  usePageTitle('Flashcards')
  const [params, setParams] = useSearchParams()
  const { state } = useProgress()
  const fallback = state.last.lectureId || SOURCE_ALL
  const source = parseSource(params.get('source'), fallback)
  const shuffled = params.get('shuffle') === '1'
  const startWordId = params.get('word') || undefined
  const [seed, setSeed] = useState(0)

  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => (value === null ? next.delete(key) : next.set(key, value)))
    setParams(next, { replace: true })
  }
  const empty = wordsForSource(source, state).length === 0

  return (
    <>
      <PageHeader eyebrow="Flashcards" title={sourceLabel(source)} description="Reveal each card, then rate how well you remembered the meaning and the 3 synonyms." />

      <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <SourceSelect value={source} onChange={(value) => update({ source: value, word: null })} className="flex-1" />
        <Button
          variant={shuffled ? 'soft' : 'secondary'}
          icon={Shuffle}
          aria-pressed={shuffled}
          onClick={() => {
            update({ shuffle: shuffled ? null : '1', word: null })
            setSeed((value) => value + 1)
          }}
        >
          {shuffled ? 'Shuffled' : 'Shuffle'}
        </Button>
      </div>

      {empty ? (
        <EmptyState icon={Layers} title="No cards here yet" action={<Button to="/flashcards?source=all">Study all lectures</Button>}>
          {source === 'weak' ? 'You have no weak words right now. Nice work!' : source === 'due' ? 'No words are due for review.' : 'There are no words for this selection.'}
        </EmptyState>
      ) : (
        <FlashcardDeck key={`${source}-${shuffled}-${seed}-${startWordId || ''}`} source={source} startWordId={startWordId} shuffled={shuffled} />
      )}
    </>
  )
}
