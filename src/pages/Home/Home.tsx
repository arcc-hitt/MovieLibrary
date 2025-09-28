import React, { useEffect, useCallback, useMemo } from 'react';
import type { Movie } from '@/types/movie';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/components/MovieCard/MovieCardSkeleton';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useSearch } from '@/hooks/useSearch';
import { useMovieStore } from '@/stores/movieStore';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Film } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const Home = React.memo(() => {
  const {
    popularMovies,
    fetchPopularMovies,
    error: storeError,
  } = useMovieStore();

  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    loadWatchlist,
  } = useWatchlistStore();

  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { handleError: handleWatchlistError } = useErrorHandler();
  
  // Use the enhanced search hook for real-time search
  const {
    inputValue,
    setQuery,
    query: searchQuery,
    results: searchResults,
    isSearching,
    isLoading: searchLoading,
    error: searchError,
    hasResults,
    isEmpty,
    clear: clearSearch,
    retry: retrySearch,
  } = useSearch({
    debounceMs: 0,
    minQueryLength: 1,
    enableCache: true,
  });

  // Load watchlist and popular movies on mount
  useEffect(() => {
    loadWatchlist();
    fetchPopularMovies();
  }, [loadWatchlist, fetchPopularMovies]);

  // Determine which movies to display - real-time based on search state
  const moviesToDisplay = useMemo(() => {
    // If user is actively searching or has search results, show search results
    if (searchQuery && searchQuery.trim()) {
      return searchResults;
    }
    // Otherwise show popular movies
    return popularMovies;
  }, [searchQuery, searchResults, popularMovies]);
  
  const showingSearchResults = useMemo(() => {
    return Boolean(searchQuery && searchQuery.trim());
  }, [searchQuery]);

  // Get the appropriate loading and error states
  const isLoading = useMemo(() => {
    if (showingSearchResults) {
      return searchLoading || isSearching;
    }
    return false; // Popular movies loading is handled separately
  }, [showingSearchResults, searchLoading, isSearching]);

  const error = useMemo(() => {
    if (showingSearchResults) {
      return searchError;
    }
    // For popular movies, show error if we have no movies and there's an error
    if (!showingSearchResults && popularMovies.length === 0 && storeError) {
      return storeError;
    }
    return null;
  }, [showingSearchResults, searchError, popularMovies.length, storeError]);

  const handleAddToWatchlist = useCallback((movie: Movie) => {
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

  const handleClearSearch = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  const handleRetryPopularMovies = useCallback(() => {
    fetchPopularMovies();
  }, [fetchPopularMovies]);

  const renderMovieGrid = useMemo(() => {
    // Handle search loading state
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]" aria-label="Loading movies">
          {Array.from({ length: 8 }).map((_, index) => (
            <MovieCardSkeleton key={`search-skeleton-${index}`} />
          ))}
        </div>
      );
    }

    // Handle error state (search or popular movies)
    if (error) {
      const isPopularMoviesError = !showingSearchResults;
      return (
        <div className="py-12">
          <ErrorDisplay
            error={error}
            onRetry={isPopularMoviesError ? handleRetryPopularMovies : retrySearch}
            variant="card"
            title={isPopularMoviesError ? "Failed to Load Movies" : "Search Failed"}
          />
        </div>
      );
    }

    // Handle empty search results
    if (showingSearchResults && isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Film className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No movies found</h2>
          <p className="text-muted-foreground mb-4">
            Try searching with different keywords or{' '}
            <button
              onClick={handleClearSearch}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              browse popular movies
            </button>
          </p>
        </div>
      );
    }

    // Render movie grid
    return (
      <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {moviesToDisplay.map((movie) => (
          <MovieCard
            key={`${showingSearchResults ? 'search' : 'popular'}-${movie.id}`}
            movie={movie}
            isInWatchlist={isInWatchlist(movie.id)}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        ))}
      </div>
    );
  }, [
    isLoading, 
    error, 
    moviesToDisplay, 
    showingSearchResults, 
    isEmpty, 
    popularMovies.length,
    inputValue,
    setQuery,
    handleClearSearch, 
    fetchPopularMovies, 
    handleAddToWatchlist, 
    handleRemoveFromWatchlist, 
    isInWatchlist
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Network Status Alert */}
      {!isOnline && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>
            You're currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && isSlowConnection && (
        <Alert role="alert" aria-live="polite">
          <AlertDescription>
            Slow connection detected. Loading may take longer than usual.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <header className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          {showingSearchResults ? 'Search Results' : 'Popular Movies'}
        </h1>
        {showingSearchResults && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
            <span className="text-sm sm:text-base">
              Showing results for "<span className="font-medium">{searchQuery}</span>"
            </span>
            <button
              onClick={handleClearSearch}
              className={cn(
                "text-primary hover:underline text-sm sm:text-base",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm",
                "self-start sm:self-auto"
              )}
              aria-label={`Clear search for ${searchQuery} and return to popular movies`}
            >
              Clear search
            </button>
          </div>
        )}
      </header>

      {/* Search Bar - Real-time search */}
      <section aria-label="Movie search" className="w-full sm:max-w-md">
        <SearchBar
          onSearch={setQuery}
          placeholder={isSlowConnection ? "Search movies (slow connection)..." : "Search for movies..."}
          isLoading={isSearching}
          autoFocus
        />
      </section>

      {/* Movies Grid */}
      <section 
        aria-label={showingSearchResults ? `Search results for ${searchQuery}` : 'Popular movies'}
        className="w-full"
      >
        {/* Loading for screen readers */}
        {isSearching && searchQuery && (
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Searching for {searchQuery}...
          </div>
        )}

        {renderMovieGrid}
      </section>

      {/* Results count */}
      {!isLoading && !error && moviesToDisplay.length > 0 && (
        <footer 
          className="text-center text-muted-foreground text-sm sm:text-base"
          aria-label="Results summary"
        >
          <p>
            Showing <span className="font-medium">{moviesToDisplay.length}</span>{' '}
            {showingSearchResults ? 'search results' : 'popular movies'}
          </p>
        </footer>
      )}

      {/* Status for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {error && `Search error: ${error}`}
        {isEmpty && searchQuery && 
          `No movies found for search term: ${searchQuery}`}
        {hasResults && searchQuery &&
          `Found ${searchResults.length} movies for: ${searchQuery}`}
      </div>
    </div>
  );
});

export default Home;