import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isLectureId, lectureIds, lectures, vocabulary } from '../src/data/vocabulary'
import { parseSource } from '../src/utils/sources'
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
    expect(total).toBe(2202)
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
  it('has 21 lectures (1-11 and 13-23, as numbered in the PDFs) of 25 words each', () => {
    expect(lectureIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23])
    expect(lectures.map((lecture) => lecture.id)).toEqual(lectureIds)
    lectures.forEach((lecture) => expect(vocabulary.filter((item) => item.lecture === lecture.id)).toHaveLength(25))
    expect(vocabulary).toHaveLength(525)
  })

  it('accepts only real lecture numbers', () => {
    expect(isLectureId(13)).toBe(true)
    expect(isLectureId(12)).toBe(false)
    expect(isLectureId(18)).toBe(false)
    expect(parseSource('23')).toBe(23)
    expect(parseSource('18')).toBe('all')
  })

  it('has unique ids and no word twice in one lecture', () => {
    expect(new Set(vocabulary.map((item) => item.id)).size).toBe(525)
    for (const id of lectureIds) {
      const words = vocabulary.filter((item) => item.lecture === id).map((item) => item.word.toLowerCase())
      expect(new Set(words).size, `Lecture ${id}`).toBe(25)
    }
  })

  it('gives a repeated word its own meaning where the lecture uses another sense', () => {
    const secure = vocabulary.filter((item) => item.word === 'Secure')
    expect(secure.map((item) => item.lecture)).toEqual([1, 14])
    expect(secure[0].meaning).not.toBe(secure[1].meaning)
    const trigger = vocabulary.filter((item) => item.word === 'Trigger')
    expect(trigger.map((item) => item.lecture)).toEqual([17, 19, 21])
    expect(new Set(trigger.map((item) => item.example)).size).toBe(3)
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
