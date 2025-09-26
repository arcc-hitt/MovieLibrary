import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useErrorHandler, useAsyncOperation } from '../hooks/useErrorHandler';
import { APIError } from '../types';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Test component that uses error handling hooks
function TestAsyncComponent() {
  const { execute, isLoading, error, isError } = useAsyncOperation();

  const handleSuccess = async () => {
    await execute(async () => {
      return 'Success!';
    });
  };

  const handleNetworkError = async () => {
    await execute(async () => {
      throw new Error('Network error occurred');
    });
  };

  const handleAPIError = async () => {
    const apiError: APIError = {
      status_code: 429,
      status_message: 'Too many requests',
      success: false,
    };
    await execute(async () => {
      throw apiError;
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Operation</button>
      <button onClick={handleNetworkError}>Network Error</button>
      <button onClick={handleAPIError}>API Error</button>
      
      {isLoading && <div>Loading...</div>}
      
      {isError && error && (
        <ErrorDisplay
          error={error}
          onRetry={() => console.log('Retry clicked')}
          variant="inline"
        />
      )}
    </div>
  );
}

// Component that throws an error for ErrorBoundary testing
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component error');
  }
  return <div>Component rendered successfully</div>;
}

describe('Error Handling Integration', () => {
  it('handles successful async operations', async () => {
    render(<TestAsyncComponent />);
    
    fireEvent.click(screen.getByText('Success Operation'));
    
    // Should show loading state briefly
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for operation to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Should not show any error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles network errors with appropriate messaging', async () => {
    render(<TestAsyncComponent />);
    
    fireEvent.click(screen.getByText('Network Error'));
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Should show network-specific error message
    expect(screen.getByText(/Network error occurred/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles API errors with appropriate messaging', async () => {
    render(<TestAsyncComponent />);
    
    fireEvent.click(screen.getByText('API Error'));
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Should show rate limit error message
    expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('ErrorBoundary catches component errors', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error boundary fallback
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('ErrorBoundary allows recovery from errors', () => {
    let shouldThrow = true;
    
    const TestComponent = () => (
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    const { rerender } = render(<TestComponent />);
    
    // Should show error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Simulate recovery
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));
    
    rerender(<TestComponent />);
    
    // Should show successful render
    expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
  });

  it('integrates ErrorBoundary with async error handling', async () => {
    const ComponentWithAsyncError = () => {
      const { handleError } = useErrorHandler();
      
      const triggerError = () => {
        // This should be caught by the ErrorBoundary
        handleError(new Error('Async error'));
      };
      
      return <button onClick={triggerError}>Trigger Async Error</button>;
    };

    render(
      <ErrorBoundary>
        <ComponentWithAsyncError />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Trigger Async Error'));
    
    // Should be caught by ErrorBoundary
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});