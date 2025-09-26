import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/components/MovieCard/MovieCardSkeleton';
import { useMovieStore } from '@/stores/movieStore';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { AlertCircle, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
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

  const [hasSearched, setHasSearched] = useState(false);

  // Load watchlist and popular movies on mount
  useEffect(() => {
    loadWatchlist();
    fetchPopularMovies();
  }, [loadWatchlist, fetchPopularMovies]);

  // Determine which movies to display
  const moviesToDisplay = hasSearched && searchQuery ? searchResults : popularMovies;
  const showingSearchResults = hasSearched && searchQuery;

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setHasSearched(true);
      await searchMovies(query);
    } else {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    clearSearch();
  };

  const handleAddToWatchlist = (movie: any) => {
    try {
      addToWatchlist(movie);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = (movieId: number) => {
    try {
      removeFromWatchlist(movieId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const renderMovieGrid = () => {
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {error}
          </p>
          <Button onClick={showingSearchResults ? () => handleSearch(searchQuery) : fetchPopularMovies}>
            Try Again
          </Button>
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
  };

  return (
    <div className="space-y-6">
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
          placeholder="Search for movies..."
          isLoading={isLoading}
        />
      </div>

      {/* Movies Grid */}
      {renderMovieGrid()}

      {/* Results count */}
      {!isLoading && !error && moviesToDisplay.length > 0 && (
        <div className="text-center text-muted-foreground">
          Showing {moviesToDisplay.length} {showingSearchResults ? 'search results' : 'popular movies'}
        </div>
      )}
    </div>
  );
};

export default Home;