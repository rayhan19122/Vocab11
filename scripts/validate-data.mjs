// Validates src/data/vocabulary.js against the PDF transcription (data-source/pdf-source.json).
// Usage: node scripts/validate-data.mjs   (exits 1 on any failure)
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { vocabulary } = await import(pathToFileURL(join(root, 'src/data/vocabulary.js')).href)
const pdf = JSON.parse(readFileSync(join(root, 'data-source/pdf-source.json'), 'utf8')).lectures

const errors = []
const check = (ok, message) => { if (!ok) errors.push(message) }

const lectureNumbers = [...new Set(vocabulary.map((item) => item.lecture))].sort((a, b) => a - b)
check(lectureNumbers.length === 11 && lectureNumbers.every((n, i) => n === i + 1), `Expected lectures 1-11, got ${lectureNumbers.join(',')}`)
check(vocabulary.length === 275, `Expected 275 entries, got ${vocabulary.length}`)
check(new Set(vocabulary.map((item) => item.id)).size === vocabulary.length, 'Duplicate IDs found')
check(new Set(vocabulary.map((item) => item.word.toLowerCase())).size === vocabulary.length, 'Duplicate words found across lectures')

for (const lecture of lectureNumbers) {
  const items = vocabulary.filter((item) => item.lecture === lecture)
  const source = pdf[lecture] || []
  check(items.length === 25, `Lecture ${lecture}: ${items.length} entries (expected 25)`)
  check(source.length === 25, `Lecture ${lecture}: PDF transcription has ${source.length} entries`)
  items.forEach((item, index) => {
    const [word, example] = source[index] || []
    check(item.word === word, `${item.id}: word "${item.word}" != PDF "${word}"`)
    check(item.example === example, `${item.id}: example differs from PDF`)
  })
}

const idPattern = /^l(0[1-9]|1[01])-w(0[1-9]|1\d|2[0-5])$/
// A sentence "uses" a term when it contains the start of the term's longest word (so inflections like "conquered" count).
const usesTerm = (sentence, term) => {
  const longest = term.toLowerCase().split(/[\s-]+/).sort((a, b) => b.length - a.length)[0]
  return sentence.toLowerCase().includes(longest.slice(0, longest.length <= 5 ? 3 : 5))
}
const levels = new Set(['easy', 'medium', 'hard'])
for (const item of vocabulary) {
  const where = `${item.id} ${item.word}`
  check(idPattern.test(item.id), `${where}: malformed id`)
  check(Array.isArray(item.synonyms) && item.synonyms.length === 3, `${where}: needs exactly 3 synonyms`)
  check(new Set(item.synonyms.map((s) => s.toLowerCase())).size === item.synonyms.length, `${where}: repeated synonym`)
  check(!item.synonyms.some((s) => s.toLowerCase() === item.word.toLowerCase()), `${where}: synonym equals the word`)
  check(item.synonyms.every((s) => s && s === s.trim()), `${where}: blank/untrimmed synonym`)
  check(Array.isArray(item.antonyms) && item.antonyms.every((a) => a && a.toLowerCase() !== item.word.toLowerCase()), `${where}: bad antonyms`)
  check(item.antonyms.every((a) => !item.synonyms.includes(a)), `${where}: antonym also listed as synonym`)
  check(typeof item.meaning === 'string' && item.meaning.length > 3 && !/useful English word/i.test(item.meaning), `${where}: missing/placeholder meaning`)
  check(typeof item.example === 'string' && item.example.length > 0, `${where}: missing example`)
  check(levels.has(item.difficulty), `${where}: bad difficulty "${item.difficulty}"`)
  const terms = [...item.synonyms, ...item.antonyms]
  check(item.termExamples && Object.keys(item.termExamples).join('|') === terms.join('|'), `${where}: termExamples must cover every synonym and antonym, in order`)
  for (const term of terms) {
    const sentence = item.termExamples?.[term]
    check(typeof sentence === 'string' && sentence.length >= 12 && /[.!?]$/.test(sentence), `${where}: weak example for "${term}"`)
    check(typeof sentence === 'string' && usesTerm(sentence, term), `${where}: example for "${term}" does not use the term: ${sentence}`)
  }
  check(typeof item.related === 'boolean', `${where}: related flag must be boolean`)
}

const withAntonyms = vocabulary.filter((item) => item.antonyms.length).length
const related = vocabulary.filter((item) => item.related).length
const diff = (level) => vocabulary.filter((item) => item.difficulty === level).length
console.log(`Entries: ${vocabulary.length} | lectures: ${lectureNumbers.length} | with antonyms: ${withAntonyms} | related-flagged: ${related}`)
console.log(`Term examples: ${vocabulary.reduce((sum, item) => sum + Object.keys(item.termExamples).length, 0)}`)
console.log(`Difficulty: easy ${diff('easy')}, medium ${diff('medium')}, hard ${diff('hard')}`)
if (errors.length) {
  console.error(`\nFAILED (${errors.length}):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log('All dataset checks passed.')
