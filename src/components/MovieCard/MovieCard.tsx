import React from 'react'
import { Heart, Plus, X } from 'lucide-react'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MovieCardProps } from '@/types/components'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export function MovieCard({
  movie,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  variant = 'default'
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist(movie.id)
    } else {
      onAddToWatchlist(movie)
    }
  }

  const getImageUrl = (posterPath: string | null) => {
    if (!posterPath) return null
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`
  }

  const formatReleaseYear = (releaseDate: string) => {
    if (!releaseDate) return ''
    return new Date(releaseDate).getFullYear()
  }

  const imageUrl = getImageUrl(movie.poster_path)
  const releaseYear = formatReleaseYear(movie.release_date)

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105",
      "bg-card border-border"
    )}>
      <div className="relative aspect-[2/3] overflow-hidden">
        {/* Movie Poster */}
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={`${movie.title} poster`}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground p-4">
              <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Watchlist Button Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant={isInWatchlist ? "destructive" : "secondary"}
            onClick={handleWatchlistToggle}
            className={cn(
              "h-8 w-8 p-0 rounded-full shadow-lg",
              isInWatchlist 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-background/90 hover:bg-background"
            )}
            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              ⭐ {movie.vote_average.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {movie.title}
          </h3>
          
          {releaseYear && (
            <p className="text-xs text-muted-foreground">
              {releaseYear}
            </p>
          )}

          {variant === 'watchlist' && isInWatchlist && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 fill-current text-red-500" />
              <span>In Watchlist</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}