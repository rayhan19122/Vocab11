import { OptionButton } from './OptionButton'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Single-choice: meaning, synonym (single), antonym and fill-in (multiple choice). */
export function ChoiceQuestion({ question, answer, submitted, onAnswer }) {
  return (
    <div role="group" aria-label="Answer options" className="grid gap-2.5">
      {question.options.map((option, index) => (
        <OptionButton
          key={option.id}
          letter={LETTERS[index]}
          label={option.label}
          selected={answer === option.label}
          submitted={submitted}
          isCorrect={option.label === question.answer}
          disabled={submitted}
          onClick={() => onAnswer(option.label)}
        />
      ))}
    </div>
  )
}
