import { useState, useEffect, useCallback, useRef } from 'react';
import { useMovieStore } from '../stores/movieStore';
import type { Movie } from '../types';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  enableCache?: boolean;
}

interface SearchCache {
  [query: string]: {
    results: Movie[];
    timestamp: number;
  };
}

/**
 * Custom hook for search functionality with debouncing
 * Handles search state management, result caching, and integrates with MovieStore
 */
// Cache expiry time (5 minutes)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    enableCache = true,
  } = options;

  const {
    searchResults,
    isLoading,
    error,
    searchQuery: storeSearchQuery,
    searchMovies,
    clearSearch,
  } = useMovieStore();

  // Local state for search input
  const [inputValue, setInputValue] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  // Cache for search results
  const cacheRef = useRef<SearchCache>({});
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);


  /**
   * Check if cached result is still valid
   */
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_EXPIRY_MS;
  }, []);

  /**
   * Get cached results for a query
   */
  const getCachedResults = useCallback((query: string): Movie[] | null => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current[query];
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.results;
    }
    
    // Remove expired cache entry
    if (cached) {
      delete cacheRef.current[query];
    }
    
    return null;
  }, [enableCache, isCacheValid]);

  /**
   * Cache search results
   */
  const setCachedResults = useCallback((query: string, results: Movie[]) => {
    if (!enableCache) return;
    
    cacheRef.current[query] = {
      results,
      timestamp: Date.now(),
    };
  }, [enableCache]);

  /**
   * Clear expired cache entries
   */
  const clearExpiredCache = useCallback(() => {
    Object.keys(cacheRef.current).forEach(query => {
      const cached = cacheRef.current[query];
      if (!isCacheValid(cached.timestamp)) {
        delete cacheRef.current[query];
      }
    });
  }, [isCacheValid]);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    // Check if query meets minimum length requirement
    if (trimmedQuery.length < minQueryLength) {
      clearSearch();
      return;
    }

    // Check cache first
    const cachedResults = getCachedResults(trimmedQuery);
    if (cachedResults) {
      // Use cached results - we need to manually update the store
      // since we're bypassing the store's search method
      console.log(`Using cached results for query: "${trimmedQuery}"`);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      await searchMovies(trimmedQuery);
      
      // Cache the results after successful search
      // Note: We get the results from the store after the search completes
      // This will be handled in the useEffect that watches searchResults
    } catch (error) {
      // Only log error if it's not an abort error
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    }
  }, [minQueryLength, getCachedResults, searchMovies, clearSearch]);

  /**
   * Cache results when search completes successfully
   */
  useEffect(() => {
    if (storeSearchQuery && searchResults.length > 0 && !error) {
      setCachedResults(storeSearchQuery, searchResults);
    }
  }, [storeSearchQuery, searchResults, error, setCachedResults]);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const trimmedInput = inputValue.trim();

    // Always clear any previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // When input empty -> reset immediately
    if (!trimmedInput) {
      if (isDebouncing) setIsDebouncing(false);
      clearSearch();
      return;
    }

    // If query too short just update flags
    if (trimmedInput.length < minQueryLength) {
      if (isDebouncing) setIsDebouncing(false);
      return;
    }

    // Immediate mode (no debouncing desired)
    if (debounceMs <= 0) {
      if (isDebouncing) setIsDebouncing(false);
      // Avoid duplicate calls for same query already in store
      if (trimmedInput !== storeSearchQuery) {
        performSearch(trimmedInput);
      }
      return; // Exit effect – no timeout
    }

    // Debounced mode
    setIsDebouncing(true);
    debounceTimeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      performSearch(trimmedInput);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, debounceMs, minQueryLength, performSearch, clearSearch, isDebouncing, storeSearchQuery]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Periodic cache cleanup
   */
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  /**
   * Update input value
   */
  const setQuery = useCallback((query: string) => {
    setInputValue(query);
  }, []);

  /**
   * Clear search and input
   */
  const clear = useCallback(() => {
    setInputValue('');
    clearSearch();
    setIsDebouncing(false);
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [clearSearch]);

  /**
   * Manually trigger search (bypass debouncing)
   */
  const searchNow = useCallback(() => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput.length >= minQueryLength) {
      setIsDebouncing(false);
      performSearch(trimmedInput);
    }
  }, [inputValue, minQueryLength, performSearch]);

  /**
   * Clear search cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const entries = Object.keys(cacheRef.current);
    const validEntries = entries.filter(query => 
      isCacheValid(cacheRef.current[query].timestamp)
    );
    
    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
    };
  }, [isCacheValid]);

  /**
   * Check if currently searching (either debouncing or loading)
   */
  const isSearching = isDebouncing || isLoading;

  /**
   * Check if we have search results
   */
  const hasResults = searchResults.length > 0;

  /**
   * Check if we should show empty state
   */
  const isEmpty = !isSearching && !hasResults && !error && Boolean(storeSearchQuery);

  /**
   * Check if input meets minimum length requirement
   */
  const isQueryValid = inputValue.trim().length >= minQueryLength;

  return {
    // Input state
    inputValue,
    setQuery,
    
    // Search state
    query: storeSearchQuery,
    results: searchResults,
    isSearching,
    isDebouncing,
    isLoading,
    error,
    
    // Status flags
    hasResults,
    isEmpty,
    isQueryValid,
    
    // Actions
    clear,
    searchNow,
    
    // Cache management
    clearCache,
    getCacheStats,
    
    // Configuration
    debounceMs,
    minQueryLength,
    enableCache,
  };
};