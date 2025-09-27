import { useState, useCallback } from 'react';
import type { APIError } from '@/types/api';

export interface ErrorState {
  error: string | APIError | Error | null;
  isError: boolean;
  errorType: 'network' | 'api' | 'validation' | 'unknown' | null;
}

export interface ErrorHandlerOptions {
  logErrors?: boolean;
  showToast?: boolean;
  fallbackMessage?: string;
}

/**
 * Hook for centralized error handling with categorization
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { logErrors = true, fallbackMessage = 'An unexpected error occurred' } = options;
  
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorType: null,
  });

  const categorizeError = useCallback((error: unknown): ErrorState['errorType'] => {
    if (typeof error === 'object' && error !== null && 'status_code' in error) {
      const apiError = error as APIError;
      if (apiError.status_code === 0) return 'network';
      return 'api';
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch')) {
        return 'network';
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return 'validation';
      }
    }
    
    return 'unknown';
  }, []);

  const handleError = useCallback((error: unknown) => {
    const errorType = categorizeError(error);
    
    let processedError: string | APIError | Error;
    
    if (typeof error === 'string') {
      processedError = error;
    } else if (error instanceof Error) {
      processedError = error;
    } else if (typeof error === 'object' && error !== null && 'status_code' in error) {
      processedError = error as APIError;
    } else {
      processedError = new Error(fallbackMessage);
    }

    setErrorState({
      error: processedError,
      isError: true,
      errorType,
    });

    if (logErrors) {
      console.error(`[${errorType?.toUpperCase()}] Error:`, error);
    }
  }, [categorizeError, logErrors, fallbackMessage]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorType: null,
    });
  }, []);

  const retryWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [handleError, clearError]);

  return {
    ...errorState,
    handleError,
    clearError,
    retryWithErrorHandling,
  };
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsyncOperation<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const { error, isError, errorType, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: unknown) => void
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (err) {
      handleError(err);
      onError?.(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const reset = useCallback(() => {
    setIsLoading(false);
    clearError();
  }, [clearError]);

  return {
    execute,
    reset,
    isLoading,
    error,
    isError,
    errorType,
    clearError,
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { handleError: handleGlobalError, ...globalError } = useErrorHandler();

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasFieldError = useCallback((field: string) => {
    return Boolean(fieldErrors[field]);
  }, [fieldErrors]);

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field] || null;
  }, [fieldErrors]);

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    hasFieldError,
    getFieldError,
    handleGlobalError,
    ...globalError,
  };
}