import type { Movie } from './movie';

/**
 * MovieCard component props
 */
export interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: number) => void;
  variant?: 'default' | 'watchlist';
}

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
}