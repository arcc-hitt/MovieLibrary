import { useEffect, useCallback } from 'react';
import { useMovieStore } from '../stores/movieStore';
import type { Movie } from '../types';

/**
 * Hook for movie data and search operations
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

  const currentMovies: Movie[] = searchQuery ? searchResults : popularMovies;

  const isSearching = Boolean(searchQuery);

  const hasMovies = currentMovies.length > 0;

  const isEmpty = !isLoading && !hasMovies && !error;

  useEffect(() => {
    // Only fetch if we don't have popular movies and we're not currently loading
    if (popularMovies.length === 0 && !isLoading && !error) {
      fetchPopularMovies();
    }
  }, [popularMovies.length, isLoading, error, fetchPopularMovies]);

  const retryFetchPopular = useCallback(() => {
    setError(null);
    fetchPopularMovies();
  }, [fetchPopularMovies, setError]);

  const retrySearch = useCallback(() => {
    if (searchQuery) {
      setError(null);
      searchMovies(searchQuery);
    }
  }, [searchQuery, searchMovies, setError]);

  const retry = useCallback(() => {
    if (isSearching) {
      retrySearch();
    } else {
      retryFetchPopular();
    }
  }, [isSearching, retrySearch, retryFetchPopular]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    movies: currentMovies,
    popularMovies,
    searchResults,
    isLoading,
    error,
    searchQuery,
    isSearching,
    hasMovies,
    isEmpty,
    fetchPopularMovies,
    searchMovies,
    clearSearch,
    retry,
    retryFetchPopular,
    retrySearch,
    clearError,
  };
};