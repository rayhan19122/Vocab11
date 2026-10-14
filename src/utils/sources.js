// Turns a "what do you want to study" choice into a list of words.
import { vocabulary } from '../data/vocabulary'
import { shuffle } from './random'
import { isDue, isWeak } from './spacedRepetition'
import { wordRecord } from './progress'

export const SOURCE_ALL = 'all'
export const SOURCE_WEAK = 'weak'
export const SOURCE_DUE = 'due'
export const SOURCE_RANDOM = 'random'

export const lectureLabel = (id) => `Lecture ${String(id).padStart(2, '0')}`

export function sourceLabel(source) {
  if (source === SOURCE_ALL) return 'All lectures'
  if (source === SOURCE_WEAK) return 'Weak words'
  if (source === SOURCE_DUE) return 'Due for review'
  if (source === SOURCE_RANDOM) return 'Random mix'
  return lectureLabel(source)
}

/** Parses a URL/query value ("3", "all", "weak", ...) into a source, or the fallback if it is not valid. */
export function parseSource(value, fallback = SOURCE_ALL) {
  if ([SOURCE_ALL, SOURCE_WEAK, SOURCE_DUE, SOURCE_RANDOM].includes(value)) return value
  const id = Number(value)
  return Number.isInteger(id) && id >= 1 && id <= 11 ? id : fallback
}

export function wordsForSource(source, state, words = vocabulary, now = new Date()) {
  if (typeof source === 'number') return words.filter((item) => item.lecture === source)
  if (source === SOURCE_WEAK) return words.filter((item) => isWeak(state.words[item.id]))
  if (source === SOURCE_DUE) return words.filter((item) => isDue(state.words[item.id], now))
  return words
}

/**
 * Words for a Quick Study / review session, most useful first:
 * 1. weak words  2. words due for review  3. words not yet mastered  4. anything else (random).
 */
export function prioritizedWords(state, count, words = vocabulary, now = new Date()) {
  const chosen = []
  const seen = new Set()
  const take = (candidates) => {
    for (const item of shuffle(candidates)) {
      if (chosen.length >= count) return
      if (!seen.has(item.id)) {
        seen.add(item.id)
        chosen.push(item)
      }
    }
  }
  take(words.filter((item) => isWeak(state.words[item.id])))
  take(words.filter((item) => isDue(state.words[item.id], now)))
  take(words.filter((item) => wordRecord(state, item.id).state !== 'mastered'))
  take(words)
  return chosen
}
