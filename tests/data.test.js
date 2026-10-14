import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lectures, vocabulary } from '../src/data/vocabulary'
import { splitAtTerm } from '../src/utils/terms'

const pdf = JSON.parse(readFileSync(new URL('../data-source/pdf-source.json', import.meta.url), 'utf8')).lectures

describe('synonym and antonym example sentences', () => {
  it('has a sentence for every synonym and antonym, and it uses the term', () => {
    let total = 0
    for (const item of vocabulary) {
      const terms = [...item.synonyms, ...item.antonyms]
      expect(Object.keys(item.termExamples), item.word).toEqual(terms)
      for (const term of terms) {
        total += 1
        const sentence = item.termExamples[term]
        expect(sentence.length, `${item.word}/${term}`).toBeGreaterThan(11)
        expect(splitAtTerm(sentence, term), `${item.word}/${term}: ${sentence}`).not.toBeNull()
      }
    }
    expect(total).toBe(1097)
  })

  it('keeps the original PDF sentence separate from the written examples', () => {
    for (const item of vocabulary) expect(Object.values(item.termExamples)).not.toContain(item.example)
  })

  it('highlights a term inside its sentence, including changed forms', () => {
    expect(splitAtTerm('She conquered her fear.', 'conquer')).toMatchObject({ before: 'She ', match: 'conquered', after: ' her fear.' })
    expect(splitAtTerm('It was a bumpy ride.', 'bumpy').match).toBe('bumpy')
    expect(splitAtTerm('Wait for me.', 'zebra')).toBeNull()
  })
})

describe('vocabulary dataset', () => {
  it('has 11 lectures of 25 words and 275 entries', () => {
    expect(lectures).toHaveLength(11)
    lectures.forEach((lecture) => expect(vocabulary.filter((item) => item.lecture === lecture.id)).toHaveLength(25))
    expect(vocabulary).toHaveLength(275)
  })

  it('has unique ids and no duplicate words', () => {
    expect(new Set(vocabulary.map((item) => item.id)).size).toBe(275)
    expect(new Set(vocabulary.map((item) => item.word.toLowerCase())).size).toBe(275)
  })

  it('matches the PDF transcription word for word and sentence for sentence', () => {
    for (const item of vocabulary) {
      const index = Number(item.id.slice(-2)) - 1
      const [word, example] = pdf[item.lecture][index]
      expect(item.word).toBe(word)
      expect(item.example).toBe(example)
    }
  })

  it('gives every word a meaning and exactly 3 distinct synonyms', () => {
    for (const item of vocabulary) {
      expect(item.meaning.length).toBeGreaterThan(3)
      expect(item.synonyms).toHaveLength(3)
      expect(new Set(item.synonyms.map((s) => s.toLowerCase())).size).toBe(3)
      expect(item.synonyms.map((s) => s.toLowerCase())).not.toContain(item.word.toLowerCase())
      expect(['easy', 'medium', 'hard']).toContain(item.difficulty)
      expect(item.antonyms.filter((a) => item.synonyms.includes(a))).toEqual([])
    }
  })
})
