import { useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { Heart, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const {
    watchlist,
    removeFromWatchlist,
    loadWatchlist,
  } = useWatchlistStore();

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleRemoveFromWatchlist = (movieId: number) => {
    try {
      removeFromWatchlist(movieId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  // Convert watchlist items to movie format for MovieCard
  const watchlistMovies = watchlist.map(item => ({
    id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    release_date: item.release_date,
    overview: '', // Not stored in watchlist
    vote_average: 0, // Not stored in watchlist
    genre_ids: [], // Not stored in watchlist
  }));

  if (watchlist.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground">
            Movies you want to watch later will appear here
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <Heart className="h-20 w-20 text-muted-foreground/30" />
            <Film className="h-8 w-8 text-muted-foreground absolute -top-1 -right-1" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start building your watchlist by browsing popular movies and adding the ones you want to watch.
          </p>
          <Button asChild>
            <Link to="/">
              Browse Movies
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <p className="text-muted-foreground">
          {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved to watch later
        </p>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-muted-foreground mb-4">
          Want to add more movies to your watchlist?
        </p>
        <Button variant="outline" asChild>
          <Link to="/">
            Browse More Movies
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Watchlist;