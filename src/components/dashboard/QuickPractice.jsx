import { Link } from 'react-router-dom'
import { ArrowRight, Ban, Blocks, BookText, Layers, Shuffle, Equal } from 'lucide-react'
import { SectionHeader } from '../common/Card'

const ITEMS = [
  { to: '/flashcards', label: 'Flashcards', hint: 'Flip and self-rate', icon: Layers },
  { to: '/practice/synonym', label: 'Synonym Practice', hint: 'Memorize the 3 synonyms', icon: Equal },
  { to: '/practice/meaning', label: 'Meaning Practice', hint: 'What does it mean?', icon: BookText },
  { to: '/practice/antonym', label: 'Antonym Practice', hint: 'Find the opposite', icon: Ban },
  { to: '/practice/fill', label: 'Fill in the Blank', hint: 'Use the original sentence', icon: Blocks },
  { to: '/practice/mixed', label: 'Mixed Quiz', hint: 'Everything, shuffled', icon: Shuffle },
]

export function QuickPractice() {
  return (
    <section aria-label="Quick practice">
      <SectionHeader title="Quick practice" className="mb-4" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <item.icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{item.label}</span>
                <span className="block truncate text-sm text-muted">{item.hint}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
