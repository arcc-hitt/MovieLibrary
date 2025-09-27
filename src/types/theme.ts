export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  name: string
  displayName: string
  mode: Exclude<ThemeMode, 'system'>
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
  }
}

export interface ThemeContextValue {
  currentTheme: ThemeMode
  resolvedTheme: Exclude<ThemeMode, 'system'>
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  themes: ThemeConfig[]
  systemTheme: Exclude<ThemeMode, 'system'>
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
  enableSystem?: boolean
}