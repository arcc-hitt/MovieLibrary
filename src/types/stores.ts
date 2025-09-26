import type { Movie, WatchlistItem } from './movie';

/**
 * Movie store state and actions interface
 */
export interface MovieStore {
  // State
  popularMovies: Movie[];
  searchResults: Movie[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchPopularMovies: () => Promise<void>;
  searchMovies: (query: string) => Promise<void>;
  clearSearch: () => void;
  setError: (error: string | null) => void;
}

/**
 * Watchlist store state and actions interface
 */
export interface WatchlistStore {
  // State
  watchlist: WatchlistItem[];
  
  // Actions
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  loadWatchlist: () => void;
  clearWatchlist: () => void;
}