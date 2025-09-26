import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './App.css'

function App() {
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
