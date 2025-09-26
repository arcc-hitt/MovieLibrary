import { useEffect, useCallback } from 'react';
import { useMovieStore } from '../stores/movieStore';
import type { Movie } from '../types';

/**
 * Custom hook for movie fetching logic
 * Handles loading states, error management, and integrates with MovieStore
 */
export const useMovies = () => {
  const {
    popularMovies,
    searchResults,
    isLoading,
    error,
    searchQuery,
    fetchPopularMovies,
    searchMovies,
    clearSearch,
    setError,
  } = useMovieStore();

  /**
   * Get current movies based on search state
   * Returns search results if searching, otherwise popular movies
   */
  const currentMovies: Movie[] = searchQuery ? searchResults : popularMovies;

  /**
   * Check if we're currently in search mode
   */
  const isSearching = Boolean(searchQuery);

  /**
   * Check if we have any movies to display
   */
  const hasMovies = currentMovies.length > 0;

  /**
   * Check if we should show empty state
   */
  const isEmpty = !isLoading && !hasMovies && !error;

  /**
   * Load popular movies on mount
   */
  useEffect(() => {
    // Only fetch if we don't have popular movies and we're not currently loading
    if (popularMovies.length === 0 && !isLoading && !error) {
      fetchPopularMovies();
    }
  }, [popularMovies.length, isLoading, error, fetchPopularMovies]);

  /**
   * Retry fetching popular movies
   */
  const retryFetchPopular = useCallback(() => {
    setError(null);
    fetchPopularMovies();
  }, [fetchPopularMovies, setError]);

  /**
   * Retry search with current query
   */
  const retrySearch = useCallback(() => {
    if (searchQuery) {
      setError(null);
      searchMovies(searchQuery);
    }
  }, [searchQuery, searchMovies, setError]);

  /**
   * Generic retry function that handles both popular and search
   */
  const retry = useCallback(() => {
    if (isSearching) {
      retrySearch();
    } else {
      retryFetchPopular();
    }
  }, [isSearching, retrySearch, retryFetchPopular]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // Data
    movies: currentMovies,
    popularMovies,
    searchResults,
    
    // State
    isLoading,
    error,
    searchQuery,
    isSearching,
    hasMovies,
    isEmpty,
    
    // Actions
    fetchPopularMovies,
    searchMovies,
    clearSearch,
    retry,
    retryFetchPopular,
    retrySearch,
    clearError,
  };
};