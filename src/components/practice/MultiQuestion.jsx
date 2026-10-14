import { OptionButton } from './OptionButton'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** "Choose the 3 synonyms": toggle exactly three options, then check. */
export function MultiQuestion({ question, answer = [], submitted, onAnswer }) {
  // Functional update so two quick taps never overwrite each other.
  const toggle = (label) =>
    onAnswer((current) => {
      const chosen = current || []
      if (chosen.includes(label)) return chosen.filter((item) => item !== label)
      return chosen.length < 3 ? [...chosen, label] : chosen
    })
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-muted" aria-live="polite">
        {answer.length} of 3 selected
      </p>
      <div role="group" aria-label="Answer options" className="grid gap-2.5">
        {question.options.map((option, index) => (
          <OptionButton
            key={option.id}
            letter={LETTERS[index]}
            label={option.label}
            selected={answer.includes(option.label)}
            submitted={submitted}
            isCorrect={question.answer.includes(option.label)}
            disabled={submitted}
            onClick={() => toggle(option.label)}
          />
        ))}
      </div>
    </div>
  )
}
