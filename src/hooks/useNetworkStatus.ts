import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
}

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Network: Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Network: Gone offline');
    };

    // Check connection type and speed if available
    const checkConnectionSpeed = () => {
      // @ts-ignore - navigator.connection is not in TypeScript types but exists in modern browsers
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || null);
        
        // Consider 2g and slow-2g as slow connections
        const slowConnections = ['slow-2g', '2g'];
        setIsSlowConnection(slowConnections.includes(connection.effectiveType));
        
        console.log('Network: Connection type:', connection.effectiveType || connection.type);
      }
    };

    // Initial check
    checkConnectionSpeed();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', checkConnectionSpeed);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, []);

  return {
    isOnline,
    isSlowConnection,
    connectionType,
  };
}

/**
 * Hook to handle network-aware API calls
 */
export function useNetworkAwareAPI() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const makeRequest = async <T>(
    requestFn: () => Promise<T>,
    options?: {
      retries?: number;
      retryDelay?: number;
      timeoutMs?: number;
    }
  ): Promise<T> => {
    const { retries = 3, retryDelay = 1000, timeoutMs = isSlowConnection ? 15000 : 10000 } = options || {};

    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        // Race between the request and timeout
        const result = await Promise.race([requestFn(), timeoutPromise]);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (error && typeof error === 'object' && 'status_code' in error) {
          const statusCode = (error as any).status_code;
          // Don't retry on 4xx errors (except 429 rate limiting)
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
            throw error;
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying, with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Network: Retrying request (attempt ${attempt + 2}/${retries + 1}) after ${delay}ms`);
      }
    }

    throw lastError!;
  };

  return {
    makeRequest,
    isOnline,
    isSlowConnection,
  };
}