// Finds a synonym/antonym inside its example sentence so the term can be highlighted.
// Tries the whole phrase first, then the longest word of the term (so "conquered" still matches "conquer").
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function splitAtTerm(sentence, term) {
  const phrase = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(term)})(?![\\p{L}])`, 'iu')
  let match = sentence.match(phrase)
  if (!match) {
    const longest = term.split(/[\s-]+/).sort((a, b) => b.length - a.length)[0]
    const stem = escapeRegExp(longest.slice(0, longest.length <= 5 ? 3 : 5))
    match = sentence.match(new RegExp(`(^|[^\\p{L}])(${stem}\\p{L}*)`, 'iu'))
  }
  if (!match) return null
  const start = match.index + match[1].length
  return { before: sentence.slice(0, start), match: match[2], after: sentence.slice(start + match[2].length) }
}
