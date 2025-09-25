// Core Movie interface from TMDB API
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

// TMDB API Response interfaces
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieResponse extends TMDBResponse<Movie> {}

// Watchlist storage interface
export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  addedAt: string; // ISO date string
}

// API Error interface
export interface APIError {
  message: string;
  status?: number;
  statusText?: string;
}