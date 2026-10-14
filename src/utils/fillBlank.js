// Removes the target word from its ORIGINAL example sentence (never a rewritten sentence).
// Most sentences contain the word exactly; a few use a different form ("Mud" -> "muddy",
// "Lab" -> "laboratory", "Brick" -> "bricks"), so we fall back to a word that starts with it.

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const BLANK = '______'

export function blankSentence(word, sentence) {
  const base = escapeRegExp(word)
  const exact = new RegExp(`(^|[^\\p{L}])(${base})(?![\\p{L}])`, 'iu')
  const loose = new RegExp(`(^|[^\\p{L}])(${base}\\p{L}*)`, 'iu')
  const match = sentence.match(exact) || sentence.match(loose)
  if (!match) return null

  const surface = match[2]
  const start = match.index + match[1].length
  return {
    before: sentence.slice(0, start),
    after: sentence.slice(start + surface.length),
    surface,
    inflected: surface.toLowerCase() !== word.toLowerCase(),
  }
}

// "Hand-feed", "hand feed" and "HAND-FEED " all compare equal; so do accents-free spellings.
export const normalizeAnswer = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-\s]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
