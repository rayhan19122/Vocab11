import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { cn } from '../../utils/cn'
import { Modal } from '../common/Modal'
import { NavBadge } from './Sidebar'
import { MOBILE_PRIMARY, NAV_ITEMS } from './navItems'

const tabClasses = (active) =>
  cn('relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition', active ? 'text-brand' : 'text-muted')

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const { derived } = useProgress()
  const primary = NAV_ITEMS.filter((item) => MOBILE_PRIMARY.includes(item.to))
  const secondary = NAV_ITEMS.filter((item) => !MOBILE_PRIMARY.includes(item.to))
  const moreActive = secondary.some((item) => pathname.startsWith(item.to))

  return (
    <>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => tabClasses(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-b-full bg-brand" />}
                <item.icon aria-hidden="true" className="size-5" />
                {item.short}
              </>
            )}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" className={tabClasses(moreActive)}>
          {moreActive && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-b-full bg-brand" />}
          <MoreHorizontal aria-hidden="true" className="size-5" />
          More
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <nav aria-label="More pages" className="mt-4 flex flex-col gap-1">
          {secondary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn('flex h-12 items-center gap-3 rounded-xl px-3 font-semibold', isActive ? 'bg-brand-soft text-brand' : 'hover:bg-surface-2')
              }
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
              <NavBadge item={item} weakCount={derived.weakIds.length} />
            </NavLink>
          ))}
        </nav>
      </Modal>
    </>
  )
}
