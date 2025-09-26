import React from 'react'
import { Heart, Plus, X } from 'lucide-react'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { LazyImage } from '@/components/LazyImage'
import { cn } from '@/lib/utils'
import type { MovieCardProps } from '@/types/components'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export const MovieCard = React.memo<MovieCardProps>(function MovieCard({
  movie,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  variant = 'default'
}) {

  const handleWatchlistToggle = React.useCallback(() => {
    if (isInWatchlist) {
      onRemoveFromWatchlist(movie.id)
    } else {
      onAddToWatchlist(movie)
    }
  }, [isInWatchlist, onRemoveFromWatchlist, onAddToWatchlist, movie])

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
        "hover:shadow-lg hover:scale-105 focus-within:shadow-lg focus-within:scale-105",
        "bg-card border-border rounded-lg",
        // Enhanced responsive design
        "w-full max-w-sm mx-auto sm:max-w-none",
        // Better touch targets on mobile
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
            <LazyImage
              src={imageUrl}
              alt={`Movie poster for ${movie.title}${releaseYear ? ` (${releaseYear})` : ''}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full bg-muted flex items-center justify-center"
              role="img"
              aria-label={`No poster available for ${movie.title}`}
            >
              <div className="text-center text-muted-foreground p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl" role="img" aria-label="Movie icon">🎬</span>
                </div>
                <p className="text-xs sm:text-sm">No Image Available</p>
              </div>
            </div>
          )}

          {/* Watchlist Button Overlay - Enhanced for accessibility */}
          <div className={cn(
            "absolute top-2 right-2 transition-opacity duration-300",
            // Always visible on mobile for better accessibility
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          )}>
            <Button
              size="sm"
              variant={isInWatchlist ? "destructive" : "secondary"}
              onClick={handleWatchlistToggle}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full shadow-lg",
                "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]",
                isInWatchlist 
                  ? "bg-destructive hover:bg-destructive/90 focus:bg-destructive/90" 
                  : "bg-background/90 hover:bg-background focus:bg-background"
              )}
              aria-label={`${isInWatchlist ? 'Remove' : 'Add'} ${movie.title} ${isInWatchlist ? 'from' : 'to'} watchlist`}
              aria-pressed={isInWatchlist}
              tabIndex={0}
            >
              {isInWatchlist ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Rating Badge - Enhanced accessibility */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="bg-background/90 text-foreground text-xs sm:text-sm"
                aria-label={`Rating: ${movie.vote_average.toFixed(1)} out of 10`}
              >
                <span aria-hidden="true">⭐</span>
                <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex-1">
          <div className="space-y-1 sm:space-y-2">
            <h3 
              id={`movie-title-${movie.id}`}
              className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]"
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

            {variant === 'watchlist' && isInWatchlist && (
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
})