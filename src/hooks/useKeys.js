import { useEffect, useRef } from 'react'

/** Calls handlers for key presses, e.g. useKeys({ ArrowRight: next, ' ': reveal }). Ignored while typing in a field. */
export function useKeys(handlers, enabled = true) {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (event) => {
      const tag = event.target?.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target?.isContentEditable) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      // Let a focused button or link handle its own Enter/Space activation.
      if ((event.key === 'Enter' || event.key === ' ') && ['BUTTON', 'A', 'SUMMARY'].includes(tag)) return
      const handler = ref.current[event.key]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
