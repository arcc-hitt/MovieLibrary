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
  /** Auto focus the input on mount */
  autoFocus?: boolean;
}

/**
 * Navigation component props
 */
export interface NavigationProps {
  currentPath: string;
}

/**
 * Layout component props
 */
export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Loading state props for components
 */
export interface LoadingProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
}