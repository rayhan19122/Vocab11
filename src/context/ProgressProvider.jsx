import { useEffect, useMemo, useReducer, useState } from 'react'
import { vocabulary } from '../data/vocabulary'
import { clearState, defaultState, loadState, saveState } from '../utils/storage'
import {
  currentStreak,
  dueWords,
  overallStats,
  recordResult,
  recordSession,
  setLast,
  todayProgress,
  weakWordIds,
} from '../utils/progress'
import { ProgressContext } from './progressContext'

const VALID_IDS = new Set(vocabulary.map((item) => item.id))

function reducer(state, action) {
  switch (action.type) {
    case 'result':
      return recordResult(state, action.wordId, action.result)
    case 'session':
      return recordSession(state, action.session)
    case 'last':
      if (state.last.lectureId === (action.patch.lectureId ?? state.last.lectureId) && state.last.wordId === (action.patch.wordId ?? state.last.wordId)) return state
      return setLast(state, action.patch)
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'replace':
      return action.state
    case 'reset':
      return { ...defaultState(), settings: state.settings }
    default:
      return state
  }
}

function useThemeSync(theme) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}

// The current time, refreshed every minute so "due for review" and the daily goal stay accurate while the app is open.
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState(VALID_IDS))
  const now = useNow()

  useEffect(() => {
    saveState(state)
  }, [state])

  useThemeSync(state.settings.theme)

  const actions = useMemo(
    () => ({
      recordResult: (wordId, result) => dispatch({ type: 'result', wordId, result }),
      recordSession: (session) => dispatch({ type: 'session', session }),
      setLast: (patch) => dispatch({ type: 'last', patch }),
      updateSettings: (patch) => dispatch({ type: 'settings', patch }),
      replaceState: (next) => dispatch({ type: 'replace', state: next }),
      resetProgress: () => {
        clearState()
        dispatch({ type: 'reset' })
      },
    }),
    [],
  )

  const value = useMemo(() => {
    return {
      state,
      actions,
      derived: {
        overall: overallStats(state, vocabulary, now),
        today: todayProgress(state, now),
        streak: currentStreak(state, now),
        weakIds: weakWordIds(state, vocabulary),
        dueIds: dueWords(state, vocabulary, now).map((item) => item.id),
      },
    }
  }, [state, actions, now])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
