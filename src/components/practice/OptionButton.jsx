import { Check, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * One answer option. After submission the correct option shows a check and a wrong choice an X,
 * so feedback never depends on colour alone.
 */
export function OptionButton({ letter, label, selected, submitted, isCorrect, onClick, disabled }) {
  const showCorrect = submitted && isCorrect
  const showWrong = submitted && selected && !isCorrect
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-base font-medium transition',
        !submitted && (selected ? 'border-brand bg-brand-soft' : 'border-line-strong bg-surface hover:border-brand hover:bg-surface-2'),
        showCorrect && 'border-brand bg-brand-soft',
        showWrong && 'border-danger bg-danger-soft',
        submitted && !showCorrect && !showWrong && 'border-line bg-surface opacity-60',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold',
          showCorrect ? 'bg-brand text-on-brand' : showWrong ? 'bg-danger text-on-brand' : selected ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted',
        )}
      >
        {showCorrect ? <Check className="size-4" /> : showWrong ? <X className="size-4" /> : letter}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {showCorrect && <span className="sr-only">Correct answer</span>}
      {showWrong && <span className="sr-only">Your answer, incorrect</span>}
    </button>
  )
}
