import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import type { ThemeMode } from '@/types/theme'

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
  className?: string
}

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
}

const themeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export const ThemeToggle = React.memo(function ThemeToggle({
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { currentTheme, toggleTheme, resolvedTheme } = useTheme()

  const handleToggle = React.useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  const getAriaLabel = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
    return `Switch to ${themeLabels[nextTheme]} theme. Current theme: ${themeLabels[currentTheme]}${
      currentTheme === 'system' ? ` (${themeLabels[resolvedTheme]})` : ''
    }`
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        'transition-all duration-200 ease-in-out',
        'hover:scale-105 active:scale-95',
        'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:not-hover:ring-0 focus:not-hover:ring-offset-0',
        showLabel ? 'gap-2' : '',
        className
      )}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      <span 
        className={cn(
          'transition-transform duration-300 ease-in-out',
          'flex items-center justify-center'
        )}
        aria-hidden="true"
      >
        {themeIcons[currentTheme]}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {themeLabels[currentTheme]}
        </span>
      )}
    </Button>
  )
})

export default ThemeToggle