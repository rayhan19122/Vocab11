import { useMediaQuery } from './useMediaQuery'
import { useProgress } from './useProgress'

/** Current theme preference plus whether the dark palette is actually showing. */
export function useTheme() {
  const { state, actions } = useProgress()
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = state.settings.theme
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  return {
    theme,
    isDark,
    setTheme: (next) => actions.updateSettings({ theme: next }),
    toggle: () => actions.updateSettings({ theme: isDark ? 'light' : 'dark' }),
  }
}
