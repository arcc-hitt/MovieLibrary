import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler, useAsyncOperation, useFormErrorHandler } from '../useErrorHandler';
import type { APIError } from '../../types/api';

describe('useErrorHandler', () => {
  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.errorType).toBeNull();
  });

  it('handles string errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('Test error message');
    });
    
    expect(result.current.error).toBe('Test error message');
    expect(result.current.isError).toBe(true);
    expect(result.current.errorType).toBe('unknown');
  });

  it('handles Error objects', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('JavaScript error');
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.errorType).toBe('unknown');
  });

  it('categorizes network errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const networkError = new Error('Network error occurred');
    
    act(() => {
      result.current.handleError(networkError);
    });
    
    expect(result.current.errorType).toBe('network');
  });

  it('categorizes API errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError: APIError = {
      status_code: 404,
      status_message: 'Not found',
      success: false,
    };
    
    act(() => {
      result.current.handleError(apiError);
    });
    
    expect(result.current.errorType).toBe('api');
  });

  it('categorizes network API errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const networkApiError: APIError = {
      status_code: 0,
      status_message: 'Network error',
      success: false,
    };
    
    act(() => {
      result.current.handleError(networkApiError);
    });
    
    expect(result.current.errorType).toBe('network');
  });

  it('categorizes validation errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const validationError = new Error('Validation failed');
    
    act(() => {
      result.current.handleError(validationError);
    });
    
    expect(result.current.errorType).toBe('validation');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('Test error');
    });
    
    expect(result.current.isError).toBe(true);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.errorType).toBeNull();
  });

  it('logs errors when enabled', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useErrorHandler({ logErrors: true }));
    
    act(() => {
      result.current.handleError('Test error');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('[UNKNOWN] Error:', 'Test error');
    
    consoleSpy.mockRestore();
  });

  it('does not log errors when disabled', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useErrorHandler({ logErrors: false }));
    
    act(() => {
      result.current.handleError('Test error');
    });
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('retries with error handling', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockOperation = vi.fn().mockResolvedValue('success');
    const mockOnSuccess = vi.fn();
    
  let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.retryWithErrorHandling(mockOperation, mockOnSuccess);
    });
    
    expect(mockOperation).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith('success');
    expect(returnValue).toBe('success');
    expect(result.current.isError).toBe(false);
  });

  it('handles errors in retry operation', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
  let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.retryWithErrorHandling(mockOperation);
    });
    
    expect(returnValue).toBeNull();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(new Error('Operation failed'));
  });
});

describe('useAsyncOperation', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAsyncOperation());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it('handles successful async operation', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    const mockOperation = vi.fn().mockResolvedValue('success');
    const mockOnSuccess = vi.fn();
    
  let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute(mockOperation, mockOnSuccess);
    });
    
    expect(mockOperation).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith('success');
    expect(returnValue).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('handles failed async operation', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    const mockOnError = vi.fn();
    
  let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute(mockOperation, undefined, mockOnError);
    });
    
    expect(returnValue).toBeNull();
    expect(mockOnError).toHaveBeenCalledWith(new Error('Operation failed'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('sets loading state during operation', async () => {
    const { result } = renderHook(() => useAsyncOperation());
    let resolveOperation: (value: string) => void;
    const mockOperation = vi.fn().mockImplementation(() => 
      new Promise<string>(resolve => { resolveOperation = resolve; })
    );
    
    // Start the operation
    act(() => {
      result.current.execute(mockOperation);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the operation
    await act(async () => {
      resolveOperation!('success');
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('resets state', () => {
    const { result } = renderHook(() => useAsyncOperation());
    
    // Set some error state
    act(() => {
      result.current.execute(vi.fn().mockRejectedValue(new Error('Test error')));
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
  });
});

describe('useFormErrorHandler', () => {
  it('initializes with no field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    
    expect(result.current.fieldErrors).toEqual({});
  });

  it('sets and gets field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    
    act(() => {
      result.current.setFieldError('email', 'Invalid email format');
    });
    
    expect(result.current.hasFieldError('email')).toBe(true);
    expect(result.current.getFieldError('email')).toBe('Invalid email format');
    expect(result.current.fieldErrors.email).toBe('Invalid email format');
  });

  it('clears individual field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    
    act(() => {
      result.current.setFieldError('email', 'Invalid email');
      result.current.setFieldError('password', 'Too short');
    });
    
    act(() => {
      result.current.clearFieldError('email');
    });
    
    expect(result.current.hasFieldError('email')).toBe(false);
    expect(result.current.hasFieldError('password')).toBe(true);
  });

  it('clears all field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    
    act(() => {
      result.current.setFieldError('email', 'Invalid email');
      result.current.setFieldError('password', 'Too short');
    });
    
    act(() => {
      result.current.clearAllFieldErrors();
    });
    
    expect(result.current.fieldErrors).toEqual({});
  });

  it('returns null for non-existent field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    
    expect(result.current.getFieldError('nonexistent')).toBeNull();
    expect(result.current.hasFieldError('nonexistent')).toBe(false);
  });
});