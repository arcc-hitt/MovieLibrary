import type { Movie } from './movie';

/**
 * Generic TMDB API response structure
 */
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * TMDB movie response type
 */
export type TMDBMovieResponse = TMDBResponse<Movie>;

/**
 * API error response structure
 */
export interface APIError {
  status_code: number;
  status_message: string;
  success: boolean;
}

/**
 * Generic API response wrapper for error handling
 */
export type APIResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: APIError;
};