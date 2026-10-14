import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { IconButton } from '../common/Button'

export function ThemeToggle({ className }) {
  const { isDark, toggle } = useTheme()
  return <IconButton icon={isDark ? Sun : Moon} label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle} className={className} />
}
