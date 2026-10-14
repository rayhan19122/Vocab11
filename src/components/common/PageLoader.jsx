export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-muted">
        <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
        <span>Loading…</span>
      </div>
    </div>
  )
}
