import React from 'react'
import { Heart, Plus, X, Film, Star } from 'lucide-react'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MovieCardProps } from '@/types/components'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const MovieCardComponent: React.FC<MovieCardProps> = ({
  movie,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist
}) => {
  // Optimistic local state so the button toggles instantly (requested UX)
  const [optimisticInWatchlist, setOptimisticInWatchlist] = React.useState(isInWatchlist)

  // Keep local state in sync if external store updates (e.g. on hydration or external change)
  React.useEffect(() => {
    setOptimisticInWatchlist(isInWatchlist)
  }, [isInWatchlist])

  const handleWatchlistToggle = React.useCallback(() => {
    setOptimisticInWatchlist(prev => !prev)
    if (optimisticInWatchlist) {
      onRemoveFromWatchlist(movie.id)
    } else {
      onAddToWatchlist(movie)
    }
  }, [optimisticInWatchlist, onRemoveFromWatchlist, onAddToWatchlist, movie])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleWatchlistToggle()
    }
  }, [handleWatchlistToggle])

  const getImageUrl = React.useCallback((posterPath: string | null) => {
    if (!posterPath) return null
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`
  }, [])

  const formatReleaseYear = React.useCallback((releaseDate: string) => {
    if (!releaseDate) return ''
    return new Date(releaseDate).getFullYear()
  }, [])

  const imageUrl = React.useMemo(() => getImageUrl(movie.poster_path), [getImageUrl, movie.poster_path])
  const releaseYear = React.useMemo(() => formatReleaseYear(movie.release_date), [formatReleaseYear, movie.release_date])

  return (
    <article 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-105 focus-within:shadow-lg focus-within:scale-105 focus-within:not-hover:scale-100",
        "bg-card border-border rounded-lg",
        "w-full max-w-sm mx-auto sm:max-w-none",
        "touch-manipulation"
      )}
      role="article"
      aria-labelledby={`movie-title-${movie.id}`}
      aria-describedby={`movie-year-${movie.id}`}
    >
      <Card className="h-full border-0 shadow-none bg-transparent">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          {/* Movie Poster */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Movie poster for ${movie.title}${releaseYear ? ` (${releaseYear})` : ''}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div 
              className="w-full h-full bg-muted flex items-center justify-center"
              role="img"
              aria-label={`No poster available for ${movie.title}`}
            >
              <div className="text-center text-muted-foreground p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <Film className="h-12 w-12 sm:w-16 sm:h-16" />
                </div>
                <p className="text-xs sm:text-sm">No Image Available</p>
              </div>
            </div>
          )}

          {/* Watchlist Button Overlay */}
          <div className={cn(
            "absolute top-2 right-2 transition-opacity duration-300",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:group-focus-within:not-group-hover:opacity-0"
          )}>
            <Button
              size="sm"
              variant={optimisticInWatchlist ? "destructive" : "secondary"}
              data-state={optimisticInWatchlist ? 'on' : 'off'}
              onClick={handleWatchlistToggle}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full shadow-lg",
                "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:not-hover:ring-0 focus:not-hover:ring-offset-0",
                "transition-colors motion-reduce:transition-none",
                "touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]",
                optimisticInWatchlist
                  ? "bg-destructive hover:bg-destructive/95 focus:bg-destructive/95"
                  : "bg-background/85 hover:bg-background focus:bg-background"
              )}
              title={`${optimisticInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}`}
              aria-label={`${optimisticInWatchlist ? 'Remove' : 'Add'} ${movie.title} ${optimisticInWatchlist ? 'from' : 'to'} watchlist`}
              aria-pressed={optimisticInWatchlist}
              tabIndex={0}
            >
              {/* Animated icon swap */}
              <span className="pointer-events-none relative flex items-center justify-center h-4 w-4">
                <Plus
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-all duration-200 ease-out",
                    "motion-reduce:transition-none",
                    optimisticInWatchlist
                      ? "opacity-0 rotate-90"
                      : "opacity-100 rotate-0"
                  )}
                  aria-hidden="true"
                />
                <X
                  className={cn(
                    "absolute inset-0 h-4 w-4 transition-all duration-200 ease-out",
                    "motion-reduce:transition-none",
                    optimisticInWatchlist
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-50 -rotate-90"
                  )}
                  aria-hidden="true"
                />
              </span>
            </Button>
          </div>

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="bg-background/90 text-foreground text-xs sm:text-sm"
                aria-label={`Rating: ${movie.vote_average.toFixed(1)} out of 10`}
              >
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" aria-hidden="true" />
                <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex-1">
          <div className="space-y-1 sm:space-y-2">
            <h3
              id={`movie-title-${movie.id}`}
              className={cn(
                "font-semibold text-sm sm:text-base leading-tight",
                "line-clamp-2",
              )}
              title={movie.title}
              aria-label={movie.title}
              data-full-title={movie.title.length > 60 ? movie.title : undefined}
            >
              {movie.title}
            </h3>
            
            {releaseYear && (
              <p 
                id={`movie-year-${movie.id}`}
                className="text-xs sm:text-sm text-muted-foreground"
                aria-label={`Released in ${releaseYear}`}
              >
                {releaseYear}
              </p>
            )}

            {optimisticInWatchlist && (
              <div 
                className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground"
                aria-label="This movie is in your watchlist"
              >
                <Heart className="h-3 w-3 fill-current text-red-500" aria-hidden="true" />
                <span>In Watchlist</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  )
}

export const MovieCard = React.memo(MovieCardComponent)