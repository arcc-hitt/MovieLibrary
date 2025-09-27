import React from 'react'
import { AppRouter } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Simplified App: removed performance monitoring & bundle logging for a lighter codebase
function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (import.meta.env.DEV) {
      // Keep minimal dev logging without extra utilities
      console.error('App Error Boundary caught an error:', error, errorInfo)
    }
  }

  return (
    <ErrorBoundary onError={handleError}>
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App
