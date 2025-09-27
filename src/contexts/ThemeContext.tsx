import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ThemeContextValue, ThemeMode, ThemeProviderProps } from '@/types/theme'
import { themes } from '@/lib/themes'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useSystemTheme } from '@/hooks/useSystemTheme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'movie-library-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(storageKey, defaultTheme)
  const systemTheme = useSystemTheme()

  // Resolve the actual theme to apply
  const resolvedTheme = useMemo(() => {
    if (theme === 'system' && enableSystem) {
      return systemTheme
    }
    return theme === 'system' ? 'light' : theme
  }, [theme, systemTheme, enableSystem])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme)
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme(enableSystem ? 'system' : 'light')
    } else {
      setTheme('light')
    }
  }

  const value: ThemeContextValue = {
    currentTheme: theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    themes,
    systemTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}