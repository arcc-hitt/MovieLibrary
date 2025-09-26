import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/components/MovieCard/MovieCardSkeleton';
import { ErrorDisplay } from '@/components/ErrorDisplay';

import { useMovieStore } from '@/stores/movieStore';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Home = React.memo(() => {
  const {
    popularMovies,
    searchResults,
    isLoading,
    error,
    searchQuery,
    fetchPopularMovies,
    searchMovies,
    clearSearch,
  } = useMovieStore();

  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    loadWatchlist,
  } = useWatchlistStore();

  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { handleError: handleWatchlistError } = useErrorHandler();
  const [hasSearched, setHasSearched] = useState(false);

  // Load watchlist and popular movies on mount
  useEffect(() => {
    loadWatchlist();
    fetchPopularMovies();
  }, [loadWatchlist, fetchPopularMovies]);

  // Determine which movies to display - memoized for performance
  const moviesToDisplay = useMemo(() => {
    return hasSearched && searchQuery ? searchResults : popularMovies;
  }, [hasSearched, searchQuery, searchResults, popularMovies]);
  
  const showingSearchResults = useMemo(() => {
    return hasSearched && searchQuery;
  }, [hasSearched, searchQuery]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      setHasSearched(true);
      await searchMovies(query);
    } else {
      handleClearSearch();
    }
  }, [searchMovies]);

  const handleClearSearch = useCallback(() => {
    setHasSearched(false);
    clearSearch();
  }, [clearSearch]);

  const handleAddToWatchlist = useCallback((movie: any) => {
    try {
      addToWatchlist(movie);
    } catch (error) {
      handleWatchlistError(error);
    }
  }, [addToWatchlist, handleWatchlistError]);

  const handleRemoveFromWatchlist = useCallback((movieId: number) => {
    try {
      removeFromWatchlist(movieId);
    } catch (error) {
      handleWatchlistError(error);
    }
  }, [removeFromWatchlist, handleWatchlistError]);

  const renderMovieGrid = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-12">
          <ErrorDisplay
            error={error}
            onRetry={showingSearchResults ? () => handleSearch(searchQuery) : fetchPopularMovies}
            variant="card"
            title={showingSearchResults ? "Search Failed" : "Failed to Load Movies"}
          />
        </div>
      );
    }

    if (moviesToDisplay.length === 0) {
      if (showingSearchResults) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with different keywords or{' '}
              <button
                onClick={handleClearSearch}
                className="text-primary hover:underline"
              >
                browse popular movies
              </button>
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Film className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No movies available</h3>
          <p className="text-muted-foreground mb-4">
            Unable to load popular movies at the moment.
          </p>
          <Button onClick={fetchPopularMovies}>
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {moviesToDisplay.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isInWatchlist={isInWatchlist(movie.id)}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            variant="default"
          />
        ))}
      </div>
    );
  }, [isLoading, error, moviesToDisplay, showingSearchResults, searchQuery, handleSearch, handleClearSearch, fetchPopularMovies, handleAddToWatchlist, handleRemoveFromWatchlist, isInWatchlist]);

  return (
    <div className="space-y-6">
      {/* Network Status Alert */}
      {!isOnline && (
        <Alert variant="destructive">
          <AlertDescription>
            You're currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && isSlowConnection && (
        <Alert>
          <AlertDescription>
            Slow connection detected. Loading may take longer than usual.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {showingSearchResults ? 'Search Results' : 'Popular Movies'}
        </h1>
        {showingSearchResults && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Showing results for "{searchQuery}"</span>
            <button
              onClick={handleClearSearch}
              className="text-primary hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          onSearch={handleSearch}
          placeholder={isSlowConnection ? "Search movies (slow connection)..." : "Search for movies..."}
          isLoading={isLoading && hasSearched}
        />
      </div>

      {/* Movies Grid */}
      {renderMovieGrid}

      {/* Results count */}
      {!isLoading && !error && moviesToDisplay.length > 0 && (
        <div className="text-center text-muted-foreground">
          Showing {moviesToDisplay.length} {showingSearchResults ? 'search results' : 'popular movies'}
        </div>
      )}
    </div>
  );
});

export default Home;