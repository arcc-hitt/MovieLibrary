import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { performanceMonitor, logBundleInfo } from '@/utils/performance'

function App() {
  // Performance monitoring setup
  React.useEffect(() => {
    // Log bundle performance info
    logBundleInfo()
    
    // Start observing performance metrics
    performanceMonitor.startObserving(['measure', 'navigation', 'paint'])
    
    // Log Core Web Vitals after a delay
    setTimeout(async () => {
      const vitals = await performanceMonitor.getCoreWebVitals()
      console.log('Core Web Vitals:', vitals)
    }, 2000)

    return () => {
      performanceMonitor.stopObserving()
    }
  }, [])

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, you might want to send this to an error reporting service
    console.error('App Error Boundary caught an error:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
