import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lectures, vocabulary } from '../src/data/vocabulary'

const pdf = JSON.parse(readFileSync(new URL('../data-source/pdf-source.json', import.meta.url), 'utf8')).lectures

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
