import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, RotateCcw, Sparkles, X } from 'lucide-react'
import { useKeys } from '../../hooks/useKeys'
import { useProgress } from '../../hooks/useProgress'
import { useSwipe } from '../../hooks/useSwipe'
import { shuffle } from '../../utils/random'
import { lectureLabel, wordsForSource } from '../../utils/sources'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { ProgressBar } from '../common/ProgressBar'
import { SpeakButton } from '../lecture/SpeakButton'
import { WordDetail } from '../lecture/WordDetail'
import { StateBadge } from '../lecture/WordBadges'

const RATINGS = [
  { id: 'dont', label: "Don't know", key: '1', icon: X, variant: 'danger', hint: 'Needs review' },
  { id: 'know', label: 'Know', key: '2', icon: Check, variant: 'secondary', hint: 'Learned' },
  { id: 'mastered', label: 'Mastered', key: '3', icon: Sparkles, variant: 'primary', hint: 'Mastered' },
]

function DeckSummary({ words, ratings, onRestart, onRetryMissed }) {
  const counts = { dont: 0, know: 0, mastered: 0 }
  Object.values(ratings).forEach((rating) => (counts[rating] += 1))
  const missed = words.filter((item) => ratings[item.id] === 'dont')
  return (
    <Card className="mx-auto max-w-xl animate-pop text-center">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Check aria-hidden="true" className="size-7" />
      </span>
      <h2 className="t-h1">Deck complete</h2>
      <p className="mt-2 text-muted">You went through {words.length} cards.</p>
      <dl className="my-6 grid grid-cols-3 gap-3">
        {[
          ['Mastered', counts.mastered],
          ['Know', counts.know],
          ["Don't know", counts.dont],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="font-display text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        {missed.length > 0 && (
          <Button onClick={() => onRetryMissed(missed)} icon={RotateCcw}>
            Review {missed.length} missed
          </Button>
        )}
        <Button variant={missed.length ? 'secondary' : 'primary'} onClick={onRestart} icon={RotateCcw}>
          Start over
        </Button>
        <Button to="/practice" variant="secondary">
          Go to practice
        </Button>
      </div>
    </Card>
  )
}

/**
 * The deck is fixed when it mounts (see key in Flashcards page) so rating a card
 * never reshuffles or shrinks the cards still to come.
 */
export function FlashcardDeck({ source, startWordId, shuffled }) {
  const { state, actions } = useProgress()
  const [deck, setDeck] = useState(() => {
    const words = wordsForSource(source, state)
    return shuffled ? shuffle(words) : words
  })
  const [index, setIndex] = useState(() => Math.max(0, deck.findIndex((item) => item.id === startWordId)))
  const [revealed, setRevealed] = useState(false)
  const [ratings, setRatings] = useState({})
  const [finished, setFinished] = useState(false)

  const entry = deck[index]
  const record = entry ? state.words[entry.id] : null
  const rated = useMemo(() => Object.keys(ratings).length, [ratings])

  const go = (next) => {
    if (next < 0 || next >= deck.length) return
    setIndex(next)
    setRevealed(false)
  }
  const rate = (rating) => {
    if (!revealed || !entry) return
    actions.recordResult(entry.id, rating)
    actions.setLast({ lectureId: entry.lecture, wordId: entry.id })
    setRatings((current) => ({ ...current, [entry.id]: rating }))
    if (index + 1 >= deck.length) setFinished(true)
    else go(index + 1)
  }
  const reveal = () => {
    setRevealed(true)
    if (entry) actions.setLast({ lectureId: entry.lecture, wordId: entry.id })
  }
  const restart = () => {
    setDeck(shuffled ? shuffle(wordsForSource(source, state)) : wordsForSource(source, state))
    setIndex(0)
    setRevealed(false)
    setRatings({})
    setFinished(false)
  }
  const retryMissed = (missed) => {
    setDeck(shuffle(missed))
    setIndex(0)
    setRevealed(false)
    setRatings({})
    setFinished(false)
  }

  useKeys(
    {
      ' ': () => (revealed ? null : reveal()),
      Enter: () => (revealed ? null : reveal()),
      ArrowRight: () => go(index + 1),
      ArrowLeft: () => go(index - 1),
      1: () => rate('dont'),
      2: () => rate('know'),
      3: () => rate('mastered'),
    },
    !finished,
  )
  const swipe = useSwipe({ onLeft: () => go(index + 1), onRight: () => go(index - 1) })

  if (finished) return <DeckSummary words={deck} ratings={ratings} onRestart={restart} onRetryMissed={retryMissed} />
  if (!entry) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            {typeof source === 'number' ? lectureLabel(source) : lectureLabel(entry.lecture)} · Card {index + 1} of {deck.length}
          </span>
          <span className="text-muted">{rated} rated</span>
        </div>
        <ProgressBar value={index + 1} max={deck.length} label="Deck progress" />
      </div>

      <Card className="min-h-[22rem] !p-6 sm:!p-10" {...swipe}>
        <div className="flex items-center justify-between gap-2">
          <p className="t-eyebrow">{lectureLabel(entry.lecture)}</p>
          <StateBadge state={record?.state || 'new'} />
        </div>

        {!revealed ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">{entry.word}</h2>
            </div>
            <SpeakButton text={entry.word} className="mt-3" />
            <div className="mt-8 text-muted">
              <p className="mb-2">Can you remember:</p>
              <ul className="inline-block text-left font-medium text-ink">
                <li>• Meaning?</li>
                <li>• 3 synonyms?</li>
              </ul>
            </div>
            <Button size="lg" icon={Eye} onClick={reveal} className="mt-8 min-w-48">
              Reveal Answer
            </Button>
          </div>
        ) : (
          <div className="animate-reveal pt-4">
            <WordDetail entry={entry} showWord headingAs="h2" />
          </div>
        )}
      </Card>

      {revealed && (
        <div className="sticky bottom-[4.75rem] z-10 mt-4 grid animate-reveal grid-cols-3 gap-2 rounded-2xl bg-bg/90 p-2 shadow-pop backdrop-blur sm:gap-3 lg:bottom-4">
          {RATINGS.map((rating) => (
            <Button key={rating.id} variant={rating.variant} size="lg" icon={rating.icon} onClick={() => rate(rating.id)} className="!h-14 flex-col !gap-0.5 sm:flex-row sm:!gap-2">
              <span>{rating.label}</span>
              <kbd aria-hidden="true" className="hidden rounded bg-black/10 px-1.5 text-xs font-bold sm:inline dark:bg-white/10">
                {rating.key}
              </kbd>
            </Button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => go(index - 1)} disabled={index === 0}>
          Previous
        </Button>
        <p className="hidden text-xs text-muted sm:block">Space reveals · ← → navigate · 1 2 3 rate</p>
        <Button variant="ghost" iconRight={ArrowRight} onClick={() => go(index + 1)} disabled={index + 1 >= deck.length}>
          Next
        </Button>
      </div>
    </div>
  )
}

