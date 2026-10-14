import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Clock, Flag, LogOut } from 'lucide-react'
import { vocabularyById } from '../../data/vocabulary'
import { useKeys } from '../../hooks/useKeys'
import { useProgress } from '../../hooks/useProgress'
import { useSound } from '../../hooks/useSound'
import { gradeQuestion, isAnswered } from '../../utils/quiz'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/Modal'
import { ProgressBar } from '../common/ProgressBar'
import { AnswerFeedback } from './AnswerFeedback'
import { ChoiceQuestion } from './ChoiceQuestion'
import { MatchQuestion } from './MatchQuestion'
import { MultiQuestion } from './MultiQuestion'
import { QuestionPrompt } from './QuestionPrompt'
import { TypeQuestion } from './TypeQuestion'

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const OPTION_KEYS = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 }

/**
 * Runs a list of questions one by one: answer, instant feedback, next.
 * Every graded word is recorded in the learner's progress (weak words included).
 * `onFinish(summary)` receives { total, correct, seconds, log }.
 */
export function QuizRunner({ questions, mode, scope, timed = false, onFinish, onExit }) {
  const { actions } = useProgress()
  const play = useSound()
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [graded, setGraded] = useState(null)
  const [log, setLog] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const nextRef = useRef(null)

  const question = questions[index]
  const submitted = graded !== null
  const correctCount = useMemo(() => log.filter((item) => item.correct).length, [log])

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (submitted) nextRef.current?.focus()
  }, [submitted])

  const submit = (value = answer) => {
    if (submitted || !isAnswered(question, value)) return
    const result = gradeQuestion(question, value)
    result.results.forEach(({ wordId, correct }) => actions.recordResult(wordId, correct ? 'correct' : 'wrong'))
    actions.setLast({ lectureId: vocabularyById[question.wordId].lecture, wordId: question.wordId })
    play(result.correct ? 'correct' : 'wrong')
    setGraded(result)
    setLog((items) => [...items, { question, answer: value, correct: result.correct }])
  }

  const next = () => {
    if (!submitted) return
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setAnswer(null)
      setGraded(null)
      return
    }
    const total = questions.length
    const correct = log.filter((item) => item.correct).length
    actions.recordSession({ date: new Date().toISOString(), mode, scope, total, correct, seconds })
    play('done')
    onFinish({ total, correct, seconds, log })
  }

  const isChoice = ['meaning', 'synonym-single', 'antonym', 'fill-choice'].includes(question.kind)
  const optionKeys = {}
  if (isChoice && !submitted) {
    Object.entries(OPTION_KEYS).forEach(([key, position]) => {
      optionKeys[key] = () => question.options[position] && submit(question.options[position].label)
    })
  }
  useKeys({ ...optionKeys, Enter: () => (submitted ? next() : submit()) })

  const needsCheck = !isChoice

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold">{scope}</span>
          <span className="flex items-center gap-4 text-muted">
            {timed && (
              <span className="flex items-center gap-1.5" aria-label={`Elapsed time ${formatTime(seconds)}`}>
                <Clock aria-hidden="true" className="size-4" />
                {formatTime(seconds)}
              </span>
            )}
            <span className="font-semibold text-ink">
              Score {correctCount}/{log.length}
            </span>
            <button type="button" onClick={() => setConfirmQuit(true)} className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-semibold hover:bg-surface-2 hover:text-ink">
              <LogOut aria-hidden="true" className="size-4" />
              Quit
            </button>
          </span>
        </div>
        <ProgressBar value={index + (submitted ? 1 : 0)} max={questions.length} label="Quiz progress" />
        <p className="mt-2 text-sm text-muted">
          Question {index + 1} of {questions.length}
        </p>
      </div>

      <Card key={question.id} className="animate-pop !p-5 sm:!p-8">
        <div className="mb-6">
          <QuestionPrompt question={question} />
        </div>

        {isChoice && <ChoiceQuestion question={question} answer={answer} submitted={submitted} onAnswer={(value) => { setAnswer(value); submit(value) }} />}
        {question.kind === 'synonym-multi' && <MultiQuestion question={question} answer={answer || []} submitted={submitted} onAnswer={setAnswer} />}
        {question.kind === 'synonym-match' && <MatchQuestion question={question} answer={answer || {}} submitted={submitted} onAnswer={setAnswer} />}
        {question.kind === 'fill-type' && <TypeQuestion question={question} answer={answer || ''} submitted={submitted} correct={graded?.correct} onAnswer={setAnswer} onSubmit={() => submit()} />}

        {submitted && (
          <div className="mt-6">
            <AnswerFeedback question={question} correct={graded.correct} />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!submitted && needsCheck && (
            <Button size="lg" icon={Check} onClick={() => submit()} disabled={!isAnswered(question, answer)}>
              Check answer
            </Button>
          )}
          {submitted && (
            <Button ref={nextRef} size="lg" iconRight={index + 1 < questions.length ? ArrowRight : Flag} onClick={next}>
              {index + 1 < questions.length ? 'Next question' : 'See results'}
            </Button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmQuit}
        onCancel={() => setConfirmQuit(false)}
        onConfirm={onExit}
        title="Quit this quiz?"
        description="Answers you already gave are saved to your progress, but this quiz result will not be recorded."
        confirmLabel="Quit quiz"
        danger
      />
    </div>
  )
}
