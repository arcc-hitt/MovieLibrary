import React from 'react'
import { cn } from '@/lib/utils'
import { trackImageLoading } from '@/utils/performance'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export const LazyImage = React.memo<LazyImageProps>(function LazyImage({
  src,
  alt,
  className,
  fallback,
  placeholder,
  onLoad,
  onError
}) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)

  // Set up intersection observer for lazy loading
  React.useEffect(() => {
    const img = imgRef.current
    if (!img) return

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          // Stop observing once image is in view
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    )

    observerRef.current.observe(img)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const imageTracker = React.useMemo(() => trackImageLoading(src, onLoad, onError), [src, onLoad, onError])

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true)
    imageTracker.onLoad()
  }, [imageTracker])

  const handleError = React.useCallback(() => {
    setHasError(true)
    imageTracker.onError()
  }, [imageTracker])

  // Show fallback if there's an error
  if (hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        {fallback || (
          <div className="text-center text-muted-foreground p-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <p className="text-sm">No Image</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          {placeholder}
        </div>
      )}
      
      {/* Actual image - only load when in view */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
})