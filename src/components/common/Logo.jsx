export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="16" fill="var(--c-brand)" />
      <path d="M17 20l15 26 15-26" fill="none" stroke="var(--c-on-brand)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="15" r="4" fill="var(--c-on-brand)" opacity="0.65" />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <p className="font-display text-xl font-bold tracking-tight">Vocab11</p>
        <p className="text-xs text-muted">11 Lectures. One Goal.</p>
      </div>
    </div>
  )
}
