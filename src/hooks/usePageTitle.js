import { useEffect } from 'react'

/** Sets the browser tab title, e.g. "Lecture 03 · Vocab11". */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Vocab11` : 'Vocab11 — 11 Lectures. One Goal.'
  }, [title])
}
