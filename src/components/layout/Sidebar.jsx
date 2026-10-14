import { NavLink } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { cn } from '../../utils/cn'
import { Logo } from '../common/Logo'
import { ThemeToggle } from './ThemeToggle'
import { NAV_ITEMS } from './navItems'

export function NavBadge({ item, weakCount }) {
  if (item.badge !== 'weak' || weakCount === 0) return null
  return (
    <span className="ml-auto rounded-full bg-warn-soft px-2 py-0.5 text-xs font-bold text-warn" aria-label={`${weakCount} weak words`}>
      {weakCount}
    </span>
  )
}

export function Sidebar() {
  const { derived } = useProgress()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <div className="px-2 pb-8">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 -left-4 w-1 rounded-r-full bg-brand" />}
                <item.icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{item.label}</span>
                <NavBadge item={item} weakCount={derived.weakIds.length} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-2 rounded-xl bg-surface-2 py-2 pr-2 pl-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Flame aria-hidden="true" className="size-4 text-warn" />
          {derived.streak}-day streak
        </p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
