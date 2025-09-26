
import {
  AlertCircle,
  WifiOff,
  Clock,
  RefreshCw,
  Home,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { APIError } from '@/types/api';

export interface ErrorDisplayProps {
  error: string | APIError | Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  variant?: 'inline' | 'card' | 'fullscreen';
  title?: string;
  showDetails?: boolean;
}

/**
 * Get user-friendly error message and icon based on error type
 */
function getErrorInfo(error: string | APIError | Error) {
  let message = 'An unexpected error occurred';
  let icon = AlertCircle;
  let isRetryable = true;
  let statusCode: number | undefined;

  if (typeof error === 'string') {
    message = error;
  } else if ('status_code' in error) {
    // APIError from TMDB
    statusCode = error.status_code;
    message = error.status_message;
    
    switch (error.status_code) {
      case 0:
        message = 'Unable to connect to the internet. Please check your connection and try again.';
        icon = WifiOff;
        break;
      case 401:
        message = 'Authentication failed. Please check your API configuration.';
        icon = AlertTriangle;
        isRetryable = false;
        break;
      case 404:
        message = 'The requested content was not found.';
        icon = AlertCircle;
        break;
      case 429:
        message = 'Too many requests. Please wait a moment and try again.';
        icon = Clock;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'The movie service is temporarily unavailable. Please try again later.';
        icon = AlertTriangle;
        break;
      default:
        if (error.status_code >= 400 && error.status_code < 500) {
          message = 'There was a problem with your request. Please try again.';
        } else if (error.status_code >= 500) {
          message = 'The service is temporarily unavailable. Please try again later.';
        }
    }
  } else if (error instanceof Error) {
    message = error.message;
    
    // Handle specific error types
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      message = 'Unable to connect to the internet. Please check your connection and try again.';
      icon = WifiOff;
    } else if (error.message.includes('timeout')) {
      message = 'The request timed out. Please try again.';
      icon = Clock;
    }
  }

  return { message, icon: icon, isRetryable, statusCode };
}

/**
 * Inline error display component
 */
function InlineError({ error, onRetry, showDetails }: Pick<ErrorDisplayProps, 'error' | 'onRetry' | 'showDetails'>) {
  const { message, icon: Icon, isRetryable, statusCode } = getErrorInfo(error);

  return (
    <Alert variant="destructive">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p>{message}</p>
          {showDetails && statusCode && (
            <p className="text-xs mt-1 opacity-75">Error Code: {statusCode}</p>
          )}
        </div>
        {isRetryable && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4 h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Card error display component
 */
function CardError({ 
  error, 
  onRetry, 
  onGoHome, 
  title = 'Something went wrong',
  showDetails 
}: Pick<ErrorDisplayProps, 'error' | 'onRetry' | 'onGoHome' | 'title' | 'showDetails'>) {
  const { message, icon: Icon, isRetryable, statusCode } = getErrorInfo(error);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{message}</p>
        
        {showDetails && statusCode && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Error Code: {statusCode}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {isRetryable && onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Fullscreen error display component
 */
function FullscreenError({ 
  error, 
  onRetry, 
  onGoHome, 
  title = 'Something went wrong',
  showDetails 
}: Pick<ErrorDisplayProps, 'error' | 'onRetry' | 'onGoHome' | 'title' | 'showDetails'>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <CardError
        error={error}
        onRetry={onRetry}
        onGoHome={onGoHome}
        title={title}
        showDetails={showDetails}
      />
    </div>
  );
}

/**
 * Main ErrorDisplay component that renders different variants
 */
export function ErrorDisplay({
  error,
  onRetry,
  onGoHome,
  variant = 'card',
  title,
  showDetails = false,
}: ErrorDisplayProps) {
  switch (variant) {
    case 'inline':
      return <InlineError error={error} onRetry={onRetry} showDetails={showDetails} />;
    case 'fullscreen':
      return (
        <FullscreenError
          error={error}
          onRetry={onRetry}
          onGoHome={onGoHome}
          title={title}
          showDetails={showDetails}
        />
      );
    case 'card':
    default:
      return (
        <CardError
          error={error}
          onRetry={onRetry}
          onGoHome={onGoHome}
          title={title}
          showDetails={showDetails}
        />
      );
  }
}

/**
 * Network status error component
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error={{
        status_code: 0,
        status_message: 'Network connection lost',
        success: false,
      }}
      onRetry={onRetry}
      variant="inline"
      title="Connection Problem"
    />
  );
}

/**
 * Rate limit error component
 */
export function RateLimitError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error={{
        status_code: 429,
        status_message: 'Too many requests',
        success: false,
      }}
      onRetry={onRetry}
      variant="inline"
      title="Rate Limited"
    />
  );
}