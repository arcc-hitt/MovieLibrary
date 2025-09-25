/**
 * Core movie interface based on TMDB API response
 */
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

/**
 * Watchlist item interface for localStorage persistence
 */
export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  addedAt: string; // ISO date string
}