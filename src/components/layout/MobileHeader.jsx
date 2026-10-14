import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { LogoMark } from '../common/Logo'
import { ThemeToggle } from './ThemeToggle'

export function MobileHeader() {
  const { derived } = useProgress()
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
      <Link to="/" className="flex items-center gap-2.5" aria-label="Vocab11 home">
        <LogoMark className="size-8" />
        <span className="font-display text-lg font-bold tracking-tight">Vocab11</span>
      </Link>
      <div className="flex items-center gap-1">
        <span className="mr-1 flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-sm font-semibold">
          <Flame aria-hidden="true" className="size-4 text-warn" />
          {derived.streak}
          <span className="sr-only">day streak</span>
        </span>
        <ThemeToggle />
      </div>
    </header>
  )
}
