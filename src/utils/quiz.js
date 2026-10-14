// Generates and grades quiz questions from the vocabulary data. Nothing here is hardcoded:
// every question is derived from a word's meaning, synonyms, antonyms or original example sentence.
import { vocabulary } from '../data/vocabulary'
import { BLANK, blankSentence, normalizeAnswer } from './fillBlank'
import { pickOne, sample, shuffle } from './random'

export const QUESTION_COUNTS = [10, 20, 30, 50]
export const MODES = ['meaning', 'synonym', 'antonym', 'fill', 'mixed']

export const MODE_LABELS = {
  meaning: 'Meaning',
  synonym: 'Synonym',
  antonym: 'Antonym',
  fill: 'Fill in the Blank',
  mixed: 'Mixed Quiz',
}

const FILL_MODES = ['choice', 'type']

const OPTION_IDS = ['a', 'b', 'c', 'd', 'e', 'f']
const toOptions = (labels) => shuffle(labels).map((label, index) => ({ id: OPTION_IDS[index], label }))

const unique = (labels) => {
  const seen = new Set()
  return labels.filter((label) => {
    const key = label.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ---------- which words can be asked ----------

export const hasAntonyms = (word) => word.antonyms.length > 0
export const canBlank = (word) => blankSentence(word.word, word.example) !== null

// ---------- word sequencing ----------

/** `count` words from `pool`, shuffled, cycling through the pool without immediate repeats. */
export function sequenceWords(pool, count) {
  const result = []
  while (result.length < count && pool.length) {
    let round = shuffle(pool)
    if (round.length > 1 && result.length && round[0].id === result[result.length - 1].id) {
      round = [...round.slice(1), round[0]]
    }
    result.push(...round)
  }
  return result.slice(0, count)
}

// ---------- distractor helpers ----------

const meaningShape = (word) => (word.meaning.startsWith('to ') ? 'verb' : 'other')

function distractorMeanings(word, universe) {
  const others = universe.filter((item) => item.id !== word.id && item.meaning !== word.meaning)
  const alike = others.filter((item) => meaningShape(item) === meaningShape(word))
  const picked = sample(alike, 3)
  if (picked.length < 3) picked.push(...sample(others.filter((item) => !picked.includes(item)), 3 - picked.length))
  return picked.map((item) => item.meaning)
}

/** Words whose synonym list overlaps with this word's: they could be genuinely correct, so never use them as distractors. */
function synonymDistractors(word, universe, count, preferred = []) {
  const taken = new Set([...word.synonyms, ...word.antonyms, word.word].map((label) => label.toLowerCase()))
  const own = new Set(word.synonyms.map((label) => label.toLowerCase()))
  const result = []
  const add = (label) => {
    if (result.length < count && !taken.has(label.toLowerCase())) {
      taken.add(label.toLowerCase())
      result.push(label)
    }
  }
  preferred.forEach(add)
  const candidates = shuffle(universe.filter((item) => item.id !== word.id && !item.synonyms.some((label) => own.has(label.toLowerCase()))))
  for (const item of candidates) {
    if (result.length >= count) break
    add(pickOne(item.synonyms))
  }
  return result
}

function antonymDistractors(word, universe, count) {
  const taken = new Set([...word.antonyms, word.word].map((label) => label.toLowerCase()))
  const result = []
  const add = (label) => {
    if (result.length < count && !taken.has(label.toLowerCase())) {
      taken.add(label.toLowerCase())
      result.push(label)
    }
  }
  sample(word.synonyms, 2).forEach(add) // a synonym is the classic wrong answer to an antonym question
  for (const item of shuffle(universe.filter((entry) => entry.id !== word.id && entry.antonyms.length))) {
    if (result.length >= count) break
    add(pickOne(item.antonyms))
  }
  return result
}

const wordShape = (text) => {
  const lower = text.toLowerCase()
  if (lower.endsWith('ly')) return 'ly'
  if (/(tion|sion|ment|ness|ity|ance|ence)$/.test(lower)) return 'noun'
  return 'plain'
}

function distractorWords(word, universe, count) {
  const others = universe.filter((item) => item.id !== word.id)
  const alike = others.filter((item) => wordShape(item.word) === wordShape(word.word))
  const picked = sample(alike, count)
  if (picked.length < count) picked.push(...sample(others.filter((item) => !picked.includes(item)), count - picked.length))
  return picked
}

// ---------- question builders ----------

const base = (id, kind, word) => ({ id, kind, wordId: word.id, wordIds: [word.id] })

function meaningQuestion(id, word, universe) {
  const answer = word.meaning
  return {
    ...base(id, 'meaning', word),
    prompt: `What does “${word.word}” mean?`,
    options: toOptions([answer, ...distractorMeanings(word, universe)]),
    answer,
  }
}

function synonymSingleQuestion(id, word, universe) {
  const answer = pickOne(word.synonyms)
  const preferred = word.antonyms.length ? [pickOne(word.antonyms)] : []
  return {
    ...base(id, 'synonym-single', word),
    prompt: 'Choose a synonym of',
    target: word.word,
    options: toOptions([answer, ...synonymDistractors(word, universe, 3, preferred)]),
    answer,
  }
}

function synonymMultiQuestion(id, word, universe) {
  const preferred = word.antonyms.length ? [pickOne(word.antonyms)] : []
  return {
    ...base(id, 'synonym-multi', word),
    prompt: 'Choose the 3 synonyms of',
    target: word.word,
    options: toOptions([...word.synonyms, ...synonymDistractors(word, universe, 2, preferred)]),
    answer: [...word.synonyms],
  }
}

function synonymMatchQuestion(id, words) {
  const pairs = words.map((word) => ({ wordId: word.id, word: word.word, answer: pickOne(word.synonyms) }))
  return {
    id,
    kind: 'synonym-match',
    wordId: words[0].id,
    wordIds: words.map((word) => word.id),
    prompt: 'Match each word with its synonym',
    pairs,
    choices: shuffle(pairs.map((pair) => pair.answer)),
  }
}

function antonymQuestion(id, word, universe) {
  const answer = pickOne(word.antonyms)
  return {
    ...base(id, 'antonym', word),
    prompt: 'Choose the antonym of',
    target: word.word,
    options: toOptions([answer, ...antonymDistractors(word, universe, 3)]),
    answer,
  }
}

function fillQuestion(id, word, universe, mode) {
  const blank = blankSentence(word.word, word.example)
  const common = {
    prompt: 'Fill in the blank',
    before: blank.before,
    after: blank.after,
    blank: BLANK,
    inflected: blank.inflected,
    baseWord: word.word,
  }
  if (mode === 'type') {
    const accept = unique([blank.surface, word.word]).map(normalizeAnswer)
    return { ...base(id, 'fill-type', word), ...common, accept, answer: blank.surface }
  }
  return {
    ...base(id, 'fill-choice', word),
    ...common,
    options: toOptions([word.word, ...distractorWords(word, universe, 3).map((item) => item.word)]),
    answer: word.word,
  }
}

// ---------- quiz assembly ----------

function pickSynonymStyle(style) {
  if (style !== 'mixed') return style
  const roll = Math.random()
  return roll < 0.5 ? 'single' : roll < 0.75 ? 'multi' : 'match'
}

/**
 * Builds a list of questions.
 *  type:       'meaning' | 'synonym' | 'antonym' | 'fill' | 'mixed'
 *  pool:       the words to ask about (a lecture, weak words, ...)
 *  universe:   all words, used for wrong-answer options
 *  synonymStyle: 'mixed' | 'single' | 'multi' | 'match'
 *  fillMode:   'choice' | 'type'
 */
export function buildQuiz({ type, pool, count, universe = vocabulary, synonymStyle = 'mixed', fillMode = 'choice' }) {
  const eligible = (type === 'antonym' ? pool.filter(hasAntonyms) : pool).filter((word) => type !== 'fill' || canBlank(word))
  if (!eligible.length) return []

  const words = sequenceWords(eligible, count)
  const questions = []
  let cursor = 0

  for (let index = 0; index < count && cursor < words.length; index += 1) {
    const id = `q${index + 1}`
    const word = words[cursor]
    cursor += 1
    const kind = type === 'mixed' ? pickMixedKind(word) : type

    if (kind === 'meaning') questions.push(meaningQuestion(id, word, universe))
    else if (kind === 'antonym') questions.push(antonymQuestion(id, word, universe))
    else if (kind === 'fill') questions.push(fillQuestion(id, word, universe, type === 'mixed' ? pickOne(FILL_MODES) : fillMode))
    else {
      const style = type === 'mixed' ? pickOne(['single', 'multi']) : pickSynonymStyle(synonymStyle)
      if (style === 'match' && eligible.length >= 4) {
        const group = [word, ...sample(eligible.filter((item) => item.id !== word.id && !item.synonyms.some((label) => word.synonyms.includes(label))), 3)]
        if (group.length === 4) questions.push(synonymMatchQuestion(id, group))
        else questions.push(synonymSingleQuestion(id, word, universe))
      } else if (style === 'multi') questions.push(synonymMultiQuestion(id, word, universe))
      else questions.push(synonymSingleQuestion(id, word, universe))
    }
  }
  return questions
}

function pickMixedKind(word) {
  const kinds = ['meaning', 'synonym', 'synonym', 'fill']
  if (hasAntonyms(word)) kinds.push('antonym')
  if (!canBlank(word)) return pickOne(kinds.filter((kind) => kind !== 'fill'))
  return pickOne(kinds)
}

// ---------- grading ----------

/** Returns { correct, results: [{ wordId, correct }] } for any question kind. */
export function gradeQuestion(question, answer) {
  switch (question.kind) {
    case 'synonym-multi': {
      const chosen = new Set((answer || []).map((label) => label.toLowerCase()))
      const right = question.answer.length === chosen.size && question.answer.every((label) => chosen.has(label.toLowerCase()))
      return { correct: right, results: [{ wordId: question.wordId, correct: right }] }
    }
    case 'synonym-match': {
      const results = question.pairs.map((pair) => ({ wordId: pair.wordId, correct: answer?.[pair.wordId] === pair.answer }))
      return { correct: results.every((result) => result.correct), results }
    }
    case 'fill-type': {
      const right = question.accept.includes(normalizeAnswer(answer || ''))
      return { correct: right, results: [{ wordId: question.wordId, correct: right }] }
    }
    default: {
      const right = answer === question.answer
      return { correct: right, results: [{ wordId: question.wordId, correct: right }] }
    }
  }
}

export const isAnswered = (question, answer) => {
  if (question.kind === 'synonym-multi') return Array.isArray(answer) && answer.length === 3
  if (question.kind === 'synonym-match') return question.pairs.every((pair) => answer?.[pair.wordId])
  if (question.kind === 'fill-type') return typeof answer === 'string' && answer.trim().length > 0
  return Boolean(answer)
}
