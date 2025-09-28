import { useEffect, useCallback, useState } from 'react';
import { useWatchlistStore } from '../stores/watchlistStore';
import type { Movie, WatchlistItem } from '../types';

/**
 * Hook for watchlist operations
 */
export const useWatchlist = () => {
  const {
    watchlist,
    addToWatchlist: storeAddToWatchlist,
    removeFromWatchlist: storeRemoveFromWatchlist,
    isInWatchlist,
    loadWatchlist,
    clearWatchlist,
  } = useWatchlistStore();

  // Local state for operation feedback
  const [isAdding, setIsAdding] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const count = watchlist.length;

  const isEmpty = count === 0;

  const isMovieBeingAdded = useCallback((movieId: number) => {
    return isAdding === movieId;
  }, [isAdding]);

  const isMovieBeingRemoved = useCallback((movieId: number) => {
    return isRemoving === movieId;
  }, [isRemoving]);

  /**
   * Check if any operation is in progress for a specific movie
   */
  const isMovieOperationInProgress = useCallback((movieId: number) => {
    return isMovieBeingAdded(movieId) || isMovieBeingRemoved(movieId);
  }, [isMovieBeingAdded, isMovieBeingRemoved]);

  /**
   * Add movie to watchlist with loading state and error handling
   */
  const addToWatchlist = useCallback(async (movie: Movie) => {
    // Prevent duplicate operations
    if (isMovieOperationInProgress(movie.id) || isInWatchlist(movie.id)) {
      return;
    }

    setIsAdding(movie.id);
    setOperationError(null);

    try {
      storeAddToWatchlist(movie);
      
      // Small delay to show feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add movie to watchlist';
      
      console.error('Error adding to watchlist:', error);
      setOperationError(errorMessage);
    } finally {
      setIsAdding(null);
    }
  }, [storeAddToWatchlist, isInWatchlist, isMovieOperationInProgress]);

  /**
   * Remove movie from watchlist with loading state and error handling
   */
  const removeFromWatchlist = useCallback(async (movieId: number) => {
    // Prevent duplicate operations
    if (isMovieOperationInProgress(movieId) || !isInWatchlist(movieId)) {
      return;
    }

    setIsRemoving(movieId);
    setOperationError(null);

    try {
      storeRemoveFromWatchlist(movieId);
      
      // Small delay to show feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove movie from watchlist';
      
      console.error('Error removing from watchlist:', error);
      setOperationError(errorMessage);
    } finally {
      setIsRemoving(null);
    }
  }, [storeRemoveFromWatchlist, isInWatchlist, isMovieOperationInProgress]);

  /**
   * Toggle movie in watchlist (add if not present, remove if present)
   */
  const toggleWatchlist = useCallback(async (movie: Movie) => {
    if (isInWatchlist(movie.id)) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  /**
   * Clear all operation errors
   */
  const clearError = useCallback(() => {
    setOperationError(null);
  }, []);

  /**
   * Get watchlist item by movie ID
   */
  const getWatchlistItem = useCallback((movieId: number): WatchlistItem | undefined => {
    return watchlist.find(item => item.id === movieId);
  }, [watchlist]);

  /**
   * Get movies sorted by date added (newest first)
   */
  const sortedWatchlist = useCallback(() => {
    return [...watchlist].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, [watchlist]);

  /**
   * Get movies sorted by title (A-Z)
   */
  const sortedByTitle = useCallback(() => {
    return [...watchlist].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
  }, [watchlist]);

  /**
   * Get movies sorted by release date (newest first)
   */
  const sortedByReleaseDate = useCallback(() => {
    return [...watchlist].sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  }, [watchlist]);

  /**
   * Search within watchlist
   */
  const searchWatchlist = useCallback((query: string): WatchlistItem[] => {
    if (!query.trim()) {
      return watchlist;
    }

    const lowercaseQuery = query.toLowerCase().trim();
    return watchlist.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery)
    );
  }, [watchlist]);

  return {
    watchlist,
    count,
    isEmpty,
    isInWatchlist,
    isMovieBeingAdded,
    isMovieBeingRemoved,
    isMovieOperationInProgress,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    loadWatchlist,
    operationError,
    clearError,
    getWatchlistItem,
    sortedWatchlist,
    sortedByTitle,
    sortedByReleaseDate,
    searchWatchlist,
  };
};