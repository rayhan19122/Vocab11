import { useId } from 'react'
import { BookmarkCheck, ChevronDown, Layers, Sparkles, Target } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../common/Button'
import { ExampleSentence, SpeakButton } from './WordDetail'
import { DifficultyBadge, StateBadge } from './WordBadges'

/** One vocabulary entry in a lecture list: synonyms always visible, details expandable. */
export function WordRow({ entry, number, record, weak, expanded, onToggle, onMark }) {
  const panelId = useId()
  const learned = record.state === 'review' || record.state === 'mastered'
  const mastered = record.state === 'mastered'

  return (
    <li className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <span aria-hidden="true" className="mt-1 w-7 shrink-0 text-sm font-bold text-muted tabular-nums">
          {String(number).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <h2 className="font-display text-2xl leading-tight font-bold">{entry.word}</h2>
            <SpeakButton text={entry.word} className="!size-8" />
            <StateBadge state={record.state} />
            {weak && (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">
                <Target aria-hidden="true" className="size-3" />
                Weak
              </span>
            )}
            <DifficultyBadge difficulty={entry.difficulty} />
          </div>
          <p className="mt-1.5 text-muted">{entry.meaning}</p>
          <ol aria-label={entry.related ? 'Closest related words' : 'Synonyms'} className="mt-3 flex flex-wrap gap-2">
            {entry.synonyms.map((synonym, index) => (
              <li key={synonym} className="flex items-center gap-1.5 rounded-lg bg-brand-soft py-1 pr-2.5 pl-1.5 text-sm font-semibold text-brand">
                <span aria-hidden="true" className="grid size-5 place-items-center rounded-md bg-surface text-[11px]">
                  {index + 1}
                </span>
                {synonym}
              </li>
            ))}
            {entry.related && <li className="self-center text-xs text-muted">(related words, no exact synonym)</li>}
          </ol>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={`${expanded ? 'Hide' : 'Show'} details for ${entry.word}`}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <ChevronDown aria-hidden="true" className={cn('size-5 transition', expanded && 'rotate-180')} />
        </button>
      </div>

      <div id={panelId} hidden={!expanded} className="animate-reveal border-t border-line px-4 py-4 sm:px-5 sm:pl-[3.75rem]">
        {expanded && (
          <div className="flex flex-col gap-4">
            {entry.antonyms.length > 0 && (
              <p>
                <span className="t-label mr-2">Antonyms</span>
                {entry.antonyms.join(', ')}
              </p>
            )}
            <div>
              <p className="t-label mb-2">Example</p>
              <ExampleSentence entry={entry} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button to={`/flashcards?source=${entry.lecture}&word=${entry.id}`} size="sm" icon={Layers}>
                Learn
              </Button>
              <Button to={`/practice/mixed?word=${entry.id}`} size="sm" variant="secondary" icon={Target}>
                Practice
              </Button>
              <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
              <Button size="sm" variant={learned ? 'soft' : 'secondary'} icon={BookmarkCheck} aria-pressed={learned} onClick={() => onMark(entry.id, learned ? 'needs-review' : 'learned')}>
                {learned ? 'Learned' : 'Mark learned'}
              </Button>
              <Button size="sm" variant={mastered ? 'soft' : 'secondary'} icon={Sparkles} aria-pressed={mastered} onClick={() => onMark(entry.id, mastered ? 'learned' : 'mastered')}>
                {mastered ? 'Mastered' : 'Mark mastered'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

