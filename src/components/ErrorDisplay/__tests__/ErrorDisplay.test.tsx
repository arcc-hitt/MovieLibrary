import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay, NetworkError, RateLimitError } from '../ErrorDisplay';
import { APIError } from '../../../types';

describe('ErrorDisplay', () => {
  it('renders string error message', () => {
    render(<ErrorDisplay error="Test error message" />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders Error object', () => {
    const error = new Error('JavaScript error');
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('JavaScript error')).toBeInTheDocument();
  });

  it('renders API error with status code', () => {
    const apiError: APIError = {
      status_code: 404,
      status_message: 'Not found',
      success: false,
    };
    
    render(<ErrorDisplay error={apiError} showDetails={true} />);
    
    expect(screen.getByText('The requested content was not found.')).toBeInTheDocument();
    expect(screen.getByText('Error Code: 404')).toBeInTheDocument();
  });

  it('handles network error (status code 0)', () => {
    const networkError: APIError = {
      status_code: 0,
      status_message: 'Network error',
      success: false,
    };
    
    render(<ErrorDisplay error={networkError} />);
    
    expect(screen.getByText(/Unable to connect to the internet/)).toBeInTheDocument();
  });

  it('handles rate limiting error (status code 429)', () => {
    const rateLimitError: APIError = {
      status_code: 429,
      status_message: 'Too many requests',
      success: false,
    };
    
    render(<ErrorDisplay error={rateLimitError} />);
    
    expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
  });

  it('handles server error (status code 500)', () => {
    const serverError: APIError = {
      status_code: 500,
      status_message: 'Internal server error',
      success: false,
    };
    
    render(<ErrorDisplay error={serverError} />);
    
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay error="Test error" onRetry={onRetry} />);
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('calls onGoHome when go home button is clicked', () => {
    const onGoHome = vi.fn();
    render(<ErrorDisplay error="Test error" onGoHome={onGoHome} />);
    
    fireEvent.click(screen.getByText('Go Home'));
    expect(onGoHome).toHaveBeenCalledOnce();
  });

  it('does not show retry button for non-retryable errors', () => {
    const authError: APIError = {
      status_code: 401,
      status_message: 'Unauthorized',
      success: false,
    };
    
    render(<ErrorDisplay error={authError} onRetry={vi.fn()} />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('renders inline variant', () => {
    render(<ErrorDisplay error="Test error" variant="inline" />);
    
    // Should render as an Alert component (inline variant)
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders fullscreen variant', () => {
    render(<ErrorDisplay error="Test error" variant="fullscreen" />);
    
    // Should render with min-h-screen class
    const container = screen.getByText('Test error').closest('.min-h-screen');
    expect(container).toBeInTheDocument();
  });

  it('shows custom title when provided', () => {
    render(<ErrorDisplay error="Test error" title="Custom Error Title" />);
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });
});

describe('NetworkError', () => {
  it('renders network error message', () => {
    render(<NetworkError />);
    
    expect(screen.getByText(/Unable to connect to the internet/)).toBeInTheDocument();
  });

  it('calls onRetry when provided', () => {
    const onRetry = vi.fn();
    render(<NetworkError onRetry={onRetry} />);
    
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('RateLimitError', () => {
  it('renders rate limit error message', () => {
    render(<RateLimitError />);
    
    expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
  });

  it('calls onRetry when provided', () => {
    const onRetry = vi.fn();
    render(<RateLimitError onRetry={onRetry} />);
    
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});