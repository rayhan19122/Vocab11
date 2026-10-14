import { describe, expect, it } from 'vitest'
import { vocabulary } from '../src/data/vocabulary'
import { blankSentence, normalizeAnswer } from '../src/utils/fillBlank'
import { buildQuiz, gradeQuestion, sequenceWords } from '../src/utils/quiz'

const rightAnswer = (question) =>
  question.kind === 'synonym-match' ? Object.fromEntries(question.pairs.map((pair) => [pair.wordId, pair.answer])) : question.answer

describe('fill in the blank', () => {
  it('blanks every word in its original sentence', () => {
    for (const item of vocabulary) {
      const blank = blankSentence(item.word, item.example)
      expect(blank, item.word).not.toBeNull()
      expect(blank.before + blank.surface + blank.after).toBe(item.example)
    }
  })

  it('handles changed word forms and picks the standalone word', () => {
    const find = (word) => vocabulary.find((item) => item.word === word)
    expect(blankSentence('Mud', find('Mud').example).surface).toBe('muddy')
    expect(blankSentence('Lab', find('Lab').example).surface).toBe('laboratory')
    expect(blankSentence('Super', find('Super').example).surface).toBe('super')
  })

  it('compares answers case-insensitively and ignores hyphen/space differences', () => {
    expect(normalizeAnswer('  Hand-Feed ')).toBe(normalizeAnswer('hand feed'))
    expect(normalizeAnswer('OUTCOME')).toBe('outcome')
  })
})

describe('quiz generation', () => {
  for (const type of ['meaning', 'synonym', 'antonym', 'fill', 'mixed']) {
    it(`builds valid ${type} questions that grade correctly`, () => {
      for (let round = 0; round < 5; round += 1) {
        const questions = buildQuiz({ type, pool: vocabulary, count: 50 })
        expect(questions).toHaveLength(50)
        questions.forEach((question, index) => {
          if (index) expect(question.wordId).not.toBe(questions[index - 1].wordId)
          if (question.options) {
            const labels = question.options.map((option) => option.label.toLowerCase())
            expect(new Set(labels).size).toBe(labels.length)
            expect(labels).toContain([].concat(question.answer)[0].toLowerCase())
          }
          expect(gradeQuestion(question, rightAnswer(question)).correct).toBe(true)
        })
      }
    })
  }

  it('never offers a true synonym as a wrong option', () => {
    for (let round = 0; round < 10; round += 1) {
      for (const question of buildQuiz({ type: 'synonym', pool: vocabulary, count: 50, synonymStyle: 'single' })) {
        const word = vocabulary.find((item) => item.id === question.wordId)
        question.options
          .filter((option) => option.label !== question.answer)
          .forEach((option) => expect(word.synonyms.map((s) => s.toLowerCase())).not.toContain(option.label.toLowerCase()))
      }
    }
  })

  it('marks wrong answers wrong', () => {
    const [single] = buildQuiz({ type: 'meaning', pool: vocabulary, count: 1 })
    expect(gradeQuestion(single, 'not an option').correct).toBe(false)
    const [multi] = buildQuiz({ type: 'synonym', pool: vocabulary, count: 1, synonymStyle: 'multi' })
    expect(gradeQuestion(multi, multi.answer.slice(0, 2)).correct).toBe(false)
  })

  it('only asks antonym questions for words that have an antonym', () => {
    for (const question of buildQuiz({ type: 'antonym', pool: vocabulary, count: 50 })) {
      expect(vocabulary.find((item) => item.id === question.wordId).antonyms.length).toBeGreaterThan(0)
    }
  })

  it('returns nothing for an empty pool and does not mutate the pool', () => {
    expect(buildQuiz({ type: 'mixed', pool: [], count: 10 })).toEqual([])
    const pool = vocabulary.slice(0, 5)
    const copy = [...pool]
    sequenceWords(pool, 12)
    expect(pool).toEqual(copy)
  })
})
