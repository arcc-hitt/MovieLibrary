import React, { useEffect, useCallback, useMemo } from 'react';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { Heart, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Watchlist = React.memo(() => {
  const {
    watchlist,
    removeFromWatchlist,
    loadWatchlist,
  } = useWatchlistStore();

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleRemoveFromWatchlist = useCallback((movieId: number) => {
    try {
      removeFromWatchlist(movieId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }, [removeFromWatchlist]);

  // Convert watchlist items to movie format for MovieCard - memoized for performance
  const watchlistMovies = useMemo(() => {
    return watchlist.map(item => ({
      id: item.id,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      overview: '', // Not stored in watchlist
      vote_average: 0, // Not stored in watchlist
      genre_ids: [], // Not stored in watchlist
    }));
  }, [watchlist]);

  const watchlistCount = useMemo(() => watchlist.length, [watchlist.length]);
  const isEmpty = useMemo(() => watchlistCount === 0, [watchlistCount]);

  if (isEmpty) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header - Enhanced for accessibility */}
        <header className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Movies you want to watch later will appear here
          </p>
        </header>

        {/* Empty State - Enhanced accessibility */}
        <section 
          className="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
          aria-label="Empty watchlist state"
        >
          <div className="relative mb-6" role="img" aria-label="Empty watchlist illustration">
            <Heart className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/30" aria-hidden="true" />
            <Film className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground absolute -top-1 -right-1" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base px-4">
            Start building your watchlist by browsing popular movies and adding the ones you want to watch.
          </p>
          <Button 
            asChild
            className="touch-manipulation min-h-[44px] px-6"
          >
            <Link 
              to="/"
              aria-label="Go to home page to browse and add movies to your watchlist"
            >
              Browse Movies
            </Link>
          </Button>
        </section>

        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite">
          Your watchlist is currently empty. Navigate to the home page to browse and add movies.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header - Enhanced for accessibility */}
      <header className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">My Watchlist</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          <span className="font-medium">{watchlistCount}</span>{' '}
          {watchlistCount === 1 ? 'movie' : 'movies'} saved to watch later
        </p>
      </header>

      {/* Movies Grid - Enhanced with proper ARIA labels */}
      <section 
        aria-label={`Your watchlist containing ${watchlistCount} ${watchlistCount === 1 ? 'movie' : 'movies'}`}
        className="w-full"
      >
        <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {watchlistMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={true}
              onAddToWatchlist={() => {}} // Not used since isInWatchlist is always true
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              variant="watchlist"
            />
          ))}
        </div>
      </section>

      {/* Footer - Enhanced accessibility */}
      <footer className="text-center pt-6 sm:pt-8">
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
          Want to add more movies to your watchlist?
        </p>
        <Button 
          variant="outline" 
          asChild
          className="touch-manipulation min-h-[44px] px-6"
        >
          <Link 
            to="/"
            aria-label="Browse more movies to add to your watchlist"
          >
            Browse More Movies
          </Link>
        </Button>
      </footer>

      {/* Screen reader announcement for watchlist count */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Your watchlist contains {watchlistCount} {watchlistCount === 1 ? 'movie' : 'movies'}.
      </div>
    </div>
  );
});

export default Watchlist;