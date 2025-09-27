import React from 'react'
import { AppRouter } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/contexts/ThemeContext'

function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (import.meta.env.DEV) {
      // Keep minimal dev logging without extra utilities
      console.error('App Error Boundary caught an error:', error, errorInfo)
    }
  }

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <ErrorBoundary onError={handleError}>
        <AppRouter />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
