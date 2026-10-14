// A deliberately simple spaced-repetition model.
//
// States:  new -> learning -> review -> mastered
// A correct answer pushes the word's next review further away; a mistake brings it back soon
// and demotes it one level. The interval depends only on the current run of correct answers.
import { addDays, addMinutes } from './date'

export const STATES = ['new', 'learning', 'review', 'mastered']

export const STATE_LABELS = {
  new: 'New',
  learning: 'Learning',
  review: 'Review',
  mastered: 'Mastered',
}

// Days until the next review, by number of correct answers in a row (index = streak, capped).
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]
const MASTERED_INTERVAL_DAYS = 45
const RETRY_MINUTES = 10

const MASTERY_STREAK = 5
const MASTERY_ACCURACY = 0.8
const WEAK_RECOVERY_STREAK = 3

export const emptyWord = () => ({
  state: 'new',
  correct: 0,
  wrong: 0,
  streak: 0,
  lastReviewed: null,
  due: null,
})

export const stateRank = (state) => Math.max(0, STATES.indexOf(state))

const attempts = (word) => word.correct + word.wrong
const intervalFor = (streak) => INTERVAL_DAYS[Math.min(streak, INTERVAL_DAYS.length - 1)]

/**
 * Applies one outcome to a word's record and returns a new record.
 *  - 'correct' / 'wrong'  : a quiz answer
 *  - 'know' / 'dont'      : a flashcard self-rating (counted like correct / wrong)
 *  - 'learned'            : manual "mark as learned" (state only, no accuracy change)
 *  - 'mastered'           : manual "mark as mastered" (state only, no accuracy change)
 *  - 'needs-review'       : manual "send back to learning" (state only)
 */
export function applyResult(previous, result, now = new Date()) {
  const word = { ...emptyWord(), ...previous }
  const stamp = now.toISOString()
  word.lastReviewed = stamp

  if (result === 'learned') {
    if (word.state === 'new' || word.state === 'learning') word.state = 'review'
    word.due = addDays(now, intervalFor(1)).toISOString()
    return word
  }
  if (result === 'mastered') {
    word.state = 'mastered'
    word.due = addDays(now, MASTERED_INTERVAL_DAYS).toISOString()
    return word
  }
  if (result === 'needs-review') {
    word.state = 'learning'
    word.streak = 0
    word.due = stamp
    return word
  }

  if (result === 'wrong' || result === 'dont') {
    word.wrong += 1
    word.streak = 0
    word.state = word.state === 'mastered' ? 'review' : 'learning'
    word.due = addMinutes(now, RETRY_MINUTES).toISOString()
    return word
  }

  // correct / know
  word.correct += 1
  word.streak += 1
  if (word.state === 'new') word.state = result === 'know' || word.streak >= 2 ? 'review' : 'learning'
  else if (word.state === 'learning' && (result === 'know' || word.streak >= 2)) word.state = 'review'
  else if (word.state === 'review' && word.streak >= MASTERY_STREAK && word.correct / attempts(word) >= MASTERY_ACCURACY) {
    word.state = 'mastered'
  }
  word.due = addDays(now, word.state === 'mastered' ? MASTERED_INTERVAL_DAYS : intervalFor(word.streak)).toISOString()
  return word
}

export const isLearned = (word) => word?.state === 'review' || word?.state === 'mastered'

// A word is "weak" once it has been missed, until it has been answered correctly a few times in a row.
export const isWeak = (word) => Boolean(word) && word.wrong > 0 && word.streak < WEAK_RECOVERY_STREAK

export function isDue(word, now = new Date()) {
  if (!word || word.state === 'new' || !word.due) return false
  return new Date(word.due).getTime() <= now.getTime()
}

export const wordAccuracy = (word) => (word && attempts(word) ? Math.round((word.correct / attempts(word)) * 100) : null)

export const WEAK_RECOVERY = WEAK_RECOVERY_STREAK
