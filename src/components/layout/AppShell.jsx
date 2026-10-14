import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { PageLoader } from '../common/PageLoader'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])
  return null
}

export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-lg bg-brand px-4 py-2 font-semibold text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <ScrollToTop />
      <Sidebar />
      <MobileHeader />
      <main id="main" tabIndex={-1} className="pb-24 outline-none lg:pb-12 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <div key={pathname} className="animate-fade-up">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
