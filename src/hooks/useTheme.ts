import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type ThemeChoice = 'system' | 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeChoice>('vitals.theme', () => 'system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  return [theme, setTheme] as const
}
