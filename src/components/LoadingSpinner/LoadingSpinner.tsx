import { Loader2, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'movie';
  text?: string;
  className?: string;
}

/**
 * Loading spinner component with multiple variants and sizes
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'movie') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Film className={cn('animate-pulse text-muted-foreground', sizeClasses[size])} />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className="flex space-x-1">
          <div className={cn('rounded-full bg-muted-foreground animate-bounce', 
            size === 'sm' ? 'w-1 h-1' : 
            size === 'md' ? 'w-2 h-2' : 
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn('rounded-full bg-muted-foreground animate-bounce', 
            size === 'sm' ? 'w-1 h-1' : 
            size === 'md' ? 'w-2 h-2' : 
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn('rounded-full bg-muted-foreground animate-bounce', 
            size === 'sm' ? 'w-1 h-1' : 
            size === 'md' ? 'w-2 h-2' : 
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )} style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <span className={cn('text-muted-foreground ml-2', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className={cn('rounded-full bg-muted-foreground animate-pulse', sizeClasses[size])} />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Fullscreen loading overlay
 */
export function LoadingOverlay({
  text = 'Loading...',
  variant = 'spinner',
  size = 'lg',
}: Pick<LoadingSpinnerProps, 'text' | 'variant' | 'size'>) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-6 shadow-lg">
        <LoadingSpinner
          variant={variant}
          size={size}
          text={text}
          className="flex-col gap-4"
        />
      </div>
    </div>
  );
}

/**
 * Inline loading state for buttons
 */
export function ButtonLoading({
  text = 'Loading...',
  size = 'sm',
}: Pick<LoadingSpinnerProps, 'text' | 'size'>) {
  return (
    <LoadingSpinner
      variant="spinner"
      size={size}
      text={text}
      className="gap-2"
    />
  );
}

/**
 * Page loading state
 */
export function PageLoading({
  text = 'Loading page...',
  variant = 'movie',
}: Pick<LoadingSpinnerProps, 'text' | 'variant'>) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner
        variant={variant}
        size="xl"
        text={text}
        className="flex-col gap-4"
      />
    </div>
  );
}