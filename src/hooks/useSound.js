import { useCallback } from 'react'
import { playSound } from '../utils/sound'
import { useProgress } from './useProgress'

export function useSound() {
  const { state } = useProgress()
  const enabled = state.settings.sound
  return useCallback((name) => playSound(name, enabled), [enabled])
}
