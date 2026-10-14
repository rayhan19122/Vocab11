// Pure state transitions and selectors for the learner's progress. No React, no storage.
import { dayKey, yesterdayKey } from './date'
import { applyResult, emptyWord, isDue, isLearned, isWeak, wordAccuracy } from './spacedRepetition'

const MAX_HISTORY = 100
const MAX_DAYS = 90

export const wordRecord = (state, id) => state.words[id] || emptyWord()

// ---------- transitions ----------

function touchStudyDay(state, wordId, { answered = 0, correct = 0 }, now) {
  const today = dayKey(now)
  const sameDay = state.today.date === today
  const ids = sameDay ? state.today.ids : []
  const isNewWordToday = !ids.includes(wordId)
  const nextIds = isNewWordToday ? [...ids, wordId] : ids

  const day = state.days[today] || { answered: 0, correct: 0, words: 0 }
  const days = {
    ...state.days,
    [today]: { answered: day.answered + answered, correct: day.correct + correct, words: nextIds.length },
  }
  const keys = Object.keys(days).sort()
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_DAYS))) delete days[key]

  let { current, longest, lastDay } = state.streak
  if (lastDay !== today) {
    current = lastDay === yesterdayKey(now) ? current + 1 : 1
    longest = Math.max(longest, current)
    lastDay = today
  }
  return { ...state, days, today: { date: today, ids: nextIds }, streak: { current, longest, lastDay } }
}

/** Records one outcome ('correct' | 'wrong' | 'know' | 'dont' | 'learned' | 'mastered' | 'needs-review') for a word. */
export function recordResult(state, wordId, result, now = new Date()) {
  const next = { ...state, words: { ...state.words, [wordId]: applyResult(state.words[wordId], result, now) } }
  const graded = result === 'correct' || result === 'know' || result === 'wrong' || result === 'dont'
  const right = result === 'correct' || result === 'know'
  return touchStudyDay(next, wordId, { answered: graded ? 1 : 0, correct: right ? 1 : 0 }, now)
}

export function recordSession(state, session) {
  const entry = { ...session, id: `${session.date}-${state.history.length}` }
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) }
}

export const setLast = (state, patch) => ({ ...state, last: { ...state.last, ...patch } })

// ---------- selectors ----------

export function lectureStats(state, words, lectureId, now = new Date()) {
  const items = words.filter((item) => item.lecture === lectureId)
  const records = items.map((item) => wordRecord(state, item.id))
  const learned = records.filter(isLearned).length
  const mastered = records.filter((record) => record.state === 'mastered').length
  const touched = records.filter((record) => record.state !== 'new').length
  const correct = records.reduce((sum, record) => sum + record.correct, 0)
  const attempts = correct + records.reduce((sum, record) => sum + record.wrong, 0)
  const total = items.length
  const percent = total ? Math.round((learned / total) * 100) : 0
  return {
    lectureId,
    total,
    learned,
    mastered,
    touched,
    percent,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
    attempts,
    due: records.filter((record) => isDue(record, now)).length,
    status: lectureStatus({ total, learned, touched }),
  }
}

export function lectureStatus({ total, learned, touched }) {
  if (touched === 0) return 'not-started'
  if (total > 0 && learned === total) return 'completed'
  return learned / total >= 0.4 ? 'in-progress' : 'learning'
}

export const STATUS_LABELS = {
  'not-started': 'Not started',
  learning: 'Learning',
  'in-progress': 'In progress',
  completed: 'Completed',
}

export function overallStats(state, words, now = new Date()) {
  const records = words.map((item) => wordRecord(state, item.id))
  const correct = records.reduce((sum, record) => sum + record.correct, 0)
  const wrong = records.reduce((sum, record) => sum + record.wrong, 0)
  const learned = records.filter(isLearned).length
  return {
    total: words.length,
    learned,
    mastered: records.filter((record) => record.state === 'mastered').length,
    remaining: words.length - learned,
    correct,
    wrong,
    answered: correct + wrong,
    accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : null,
    due: records.filter((record) => isDue(record, now)).length,
    weak: records.filter(isWeak).length,
  }
}

export const weakWordIds = (state, words) => words.filter((item) => isWeak(state.words[item.id])).map((item) => item.id)

export const dueWords = (state, words, now = new Date()) => words.filter((item) => isDue(state.words[item.id], now))

export function todayProgress(state, now = new Date()) {
  const today = dayKey(now)
  const done = state.today.date === today ? state.today.ids.length : 0
  const goal = state.settings.dailyGoal
  return { done, goal, percent: Math.min(100, Math.round((done / goal) * 100)) }
}

/** Streak as shown to the learner: it only counts if the learner studied today or yesterday. */
export function currentStreak(state, now = new Date()) {
  const { current, lastDay } = state.streak
  return lastDay === dayKey(now) || lastDay === yesterdayKey(now) ? current : 0
}

export function mostMissed(state, words, limit = 5) {
  return words
    .map((item) => ({ item, record: wordRecord(state, item.id) }))
    .filter(({ record }) => record.wrong > 0)
    .sort((a, b) => b.record.wrong - a.record.wrong || (wordAccuracy(a.record) ?? 0) - (wordAccuracy(b.record) ?? 0))
    .slice(0, limit)
}

export function mostPracticed(state, words, limit = 5) {
  return words
    .map((item) => ({ item, record: wordRecord(state, item.id) }))
    .filter(({ record }) => record.correct + record.wrong > 0)
    .sort((a, b) => b.record.correct + b.record.wrong - (a.record.correct + a.record.wrong))
    .slice(0, limit)
}
