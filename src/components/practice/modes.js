import { Ban, Blocks, BookText, Equal, Shuffle } from 'lucide-react'

export const MODE_INFO = {
  synonym: {
    title: 'Synonym Practice',
    description: 'The core drill: pick, select all 3, or match synonyms until they stick.',
    icon: Equal,
    featured: true,
  },
  meaning: { title: 'Meaning Practice', description: 'Choose the right meaning for each word.', icon: BookText },
  antonym: { title: 'Antonym Practice', description: 'Find the opposite. Only words with a reliable antonym appear.', icon: Ban },
  fill: { title: 'Fill in the Blank', description: 'Complete the original example sentence from the lecture.', icon: Blocks },
  mixed: { title: 'Mixed Quiz', description: 'Meaning, synonym, antonym and fill-in questions, shuffled.', icon: Shuffle },
}

export const MODE_ORDER = ['synonym', 'meaning', 'antonym', 'fill', 'mixed']
