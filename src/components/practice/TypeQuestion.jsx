import { Check, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Type-in answer for fill-in-the-blank. Case-insensitive checking happens in gradeQuestion. */
export function TypeQuestion({ question, answer = '', submitted, correct, onAnswer, onSubmit }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!submitted) onSubmit()
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor="type-answer" className="text-sm font-semibold">
        Type the missing word
      </label>
      <div className="relative">
        <input
          id="type-answer"
          value={answer}
          onChange={(event) => onAnswer(event.target.value)}
          disabled={submitted}
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="Type your answer"
          className={cn(
            'h-14 w-full rounded-xl border-2 bg-surface px-4 pr-12 text-lg font-medium transition',
            !submitted && 'border-line-strong focus-visible:border-brand',
            submitted && correct && 'border-brand bg-brand-soft',
            submitted && !correct && 'border-danger bg-danger-soft',
          )}
        />
        {submitted && (correct ? <Check aria-hidden="true" className="absolute top-4 right-4 size-6 text-brand" /> : <X aria-hidden="true" className="absolute top-4 right-4 size-6 text-danger" />)}
      </div>
      {submitted && !correct && (
        <p className="text-sm">
          Correct answer: <strong>{question.answer}</strong>
        </p>
      )}
    </form>
  )
}
