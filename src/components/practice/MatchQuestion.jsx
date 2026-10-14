import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Matching: tap a word, then tap its synonym. Tap a filled row to clear it.
 * `answer` maps wordId -> chosen synonym.
 */
export function MatchQuestion({ question, answer = {}, submitted, onAnswer }) {
  const firstEmpty = question.pairs.find((pair) => !answer[pair.wordId])
  const [activeId, setActiveId] = useState(null)
  const active = activeId && !answer[activeId] ? activeId : firstEmpty?.wordId
  const used = new Set(Object.values(answer))

  const choose = (label) => {
    if (submitted || !active) return
    onAnswer((current) => ({ ...current, [active]: label }))
    setActiveId(null)
  }
  const clear = (wordId) => {
    if (submitted) return
    onAnswer((current) => {
      const next = { ...current }
      delete next[wordId]
      return next
    })
    setActiveId(wordId)
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <ul className="grid gap-2.5" aria-label="Words">
        {question.pairs.map((pair) => {
          const chosen = answer[pair.wordId]
          const right = submitted && chosen === pair.answer
          const wrong = submitted && chosen !== pair.answer
          const isActive = !submitted && active === pair.wordId
          return (
            <li key={pair.wordId}>
              <button
                type="button"
                onClick={() => (chosen ? clear(pair.wordId) : setActiveId(pair.wordId))}
                disabled={submitted}
                aria-label={chosen ? `${pair.word} matched with ${chosen}. Tap to clear.` : `${pair.word}, choose its synonym`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex min-h-14 w-full items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-left transition',
                  isActive && 'border-brand bg-brand-soft',
                  !isActive && !submitted && 'border-line-strong bg-surface hover:bg-surface-2',
                  right && 'border-brand bg-brand-soft',
                  wrong && 'border-danger bg-danger-soft',
                )}
              >
                <span className="font-semibold">{pair.word}</span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
                <span className={cn('min-w-0 flex-1 truncate', !chosen && 'text-muted')}>{chosen || '…'}</span>
                {right && <Check aria-hidden="true" className="size-5 shrink-0 text-brand" />}
                {wrong && <X aria-hidden="true" className="size-5 shrink-0 text-danger" />}
                {right && <span className="sr-only">Correct</span>}
                {wrong && <span className="sr-only">Incorrect, correct synonym is {pair.answer}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <ul className="flex flex-wrap content-start gap-2.5" aria-label="Synonyms to match">
        {question.choices.map((label) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => choose(label)}
              disabled={submitted || used.has(label)}
              className="min-h-11 rounded-xl border-2 border-line-strong bg-surface px-4 font-semibold transition hover:border-brand hover:bg-brand-soft disabled:border-line disabled:bg-surface-2 disabled:text-muted disabled:line-through disabled:hover:bg-surface-2"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
