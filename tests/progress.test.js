import { describe, expect, it } from 'vitest'
import { vocabulary } from '../src/data/vocabulary'
import { currentStreak, lectureStats, overallStats, recordResult, todayProgress } from '../src/utils/progress'
import { isDue, isWeak } from '../src/utils/spacedRepetition'
import { defaultState, exportJson, parseImport, sanitizeState } from '../src/utils/storage'

const ids = new Set(vocabulary.map((item) => item.id))
const at = (iso) => new Date(iso)

describe('spaced repetition', () => {
  it('flags a missed word as weak and due soon, then clears it after 3 correct in a row', () => {
    let state = recordResult(defaultState(), 'l01-w01', 'wrong', at('2026-10-14T10:00:00'))
    expect(state.words['l01-w01'].state).toBe('learning')
    expect(isWeak(state.words['l01-w01'])).toBe(true)
    expect(isDue(state.words['l01-w01'], at('2026-10-14T10:11:00'))).toBe(true)
    for (let i = 1; i <= 3; i += 1) state = recordResult(state, 'l01-w01', 'correct', at(`2026-10-14T1${i}:00:00`))
    expect(isWeak(state.words['l01-w01'])).toBe(false)
    expect(state.words['l01-w01'].state).toBe('review')
  })

  it('promotes to mastered after a long streak and demotes on a mistake', () => {
    let state = defaultState()
    for (let i = 0; i < 6; i += 1) state = recordResult(state, 'l01-w02', 'correct', at(`2026-10-14T0${i + 1}:00:00`))
    expect(state.words['l01-w02'].state).toBe('mastered')
    state = recordResult(state, 'l01-w02', 'wrong', at('2026-10-14T12:00:00'))
    expect(state.words['l01-w02'].state).toBe('review')
  })

  it('handles flashcard ratings and manual marks without distorting accuracy', () => {
    let state = recordResult(defaultState(), 'l02-w01', 'know')
    expect(state.words['l02-w01'].state).toBe('review')
    state = recordResult(state, 'l02-w02', 'mastered')
    expect(state.words['l02-w02']).toMatchObject({ state: 'mastered', correct: 0, wrong: 0 })
    expect(overallStats(state, vocabulary).accuracy).toBe(100)
  })
})

describe('streak, daily goal and lecture stats', () => {
  it('counts consecutive days and resets after a gap', () => {
    let state = recordResult(defaultState(), 'l01-w01', 'correct', at('2026-10-14T09:00:00'))
    state = recordResult(state, 'l01-w01', 'correct', at('2026-10-15T09:00:00'))
    expect(state.streak.current).toBe(2)
    state = recordResult(state, 'l01-w01', 'correct', at('2026-10-18T09:00:00'))
    expect(state.streak.current).toBe(1)
    expect(currentStreak(state, at('2026-10-18T20:00:00'))).toBe(1)
    expect(currentStreak(state, at('2026-10-21T20:00:00'))).toBe(0)
  })

  it('counts each word once per day toward the daily goal', () => {
    let state = recordResult(defaultState(), 'l01-w01', 'correct', at('2026-10-14T09:00:00'))
    state = recordResult(state, 'l01-w01', 'wrong', at('2026-10-14T09:05:00'))
    state = recordResult(state, 'l01-w02', 'correct', at('2026-10-14T09:06:00'))
    expect(todayProgress(state, at('2026-10-14T20:00:00')).done).toBe(2)
    expect(todayProgress(state, at('2026-10-15T08:00:00')).done).toBe(0)
  })

  it('summarises a lecture', () => {
    let state = recordResult(defaultState(), 'l02-w01', 'know')
    state = recordResult(state, 'l02-w02', 'mastered')
    expect(lectureStats(state, vocabulary, 2)).toMatchObject({ total: 25, learned: 2, mastered: 1, percent: 8, status: 'learning' })
    expect(lectureStats(defaultState(), vocabulary, 3).status).toBe('not-started')
  })
})

describe('storage', () => {
  it('falls back to defaults for garbage input', () => {
    for (const junk of [null, undefined, 5, 'x', [], {}, { words: 5 }, { settings: { theme: 'neon', dailyGoal: -4 } }]) {
      const state = sanitizeState(junk, ids)
      expect(state.settings).toMatchObject({ theme: 'system', dailyGoal: 20 })
      expect(state.words).toEqual({})
    }
  })

  it('drops unknown words and clamps bad numbers', () => {
    const state = sanitizeState({ words: { 'l01-w01': { state: 'mastered', correct: -5, wrong: 'x' }, bogus: { state: 'new' } } }, ids)
    expect(Object.keys(state.words)).toEqual(['l01-w01'])
    expect(state.words['l01-w01']).toMatchObject({ state: 'mastered', correct: 0, wrong: 0 })
  })

  it('round-trips an export and rejects files that are not backups', () => {
    const state = recordResult(recordResult(defaultState(), 'l01-w01', 'wrong'), 'l05-w10', 'know')
    expect(parseImport(exportJson(state), ids).words).toEqual(state.words)
    for (const bad of ['not json', '{}', '[]', 'null', '{"app":"other","words":{}}']) expect(() => parseImport(bad, ids)).toThrow()
  })
})
